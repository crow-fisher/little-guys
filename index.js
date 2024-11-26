var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

var materialSelect = document.getElementById("materialSelect");

var selectedMaterial = "static";

materialSelect.addEventListener('change', (e) => selectedMaterial = e.target.value);
MAIN_CANVAS.addEventListener('mousemove', handleClick, false);

var mouseDown = 0;
var lastClickEvent = null;
document.body.onmousedown = function() { 
    mouseDown = 1;
}
document.body.onmouseup = function() {
    mouseDown = 0;
}

// each square is 16x16
// 'little guys' may aquire multiple squares
const BASE_SIZE = 8; 
var CANVAS_SQUARES_X = 128
var CANVAS_SQUARES_Y = 64

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

class BaseSquare {
    constructor(sizeX, sizeY, posX, posY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.color = "A1A6B4";

        // block properties - overridden by block type
        this.physicsEnabled = true;

        this.speed = 0;
        this.physicsBlocksFallen = 0;
    };
    reset() {
        this.physicsBlocksFallen = 0;
        this.speed += 1;
    }
    render() {
        MAIN_CONTEXT.fillStyle = '#' + this.color;
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };

    // Returns true if something happened.
    // Keep looping on physics until all are false.
    physics() {
        if (!this.physicsEnabled) {
            return false;
        }
        if (this.physicsBlocksFallen == this.speed) {
            return false;
        }
        var finalPos;
        var bonkPos = -1;

        if (this.speed == 1) {
            if (getSquare(this.posX, this.posY + 1)) {
                return false;
            } else {
            }
        } else {
            for (let i = 1; i < this.speed + 1; i++) {
                if (getSquare(this.posX, this.posY + i)) {
                    bonkPos = this.posY + i;
                    // we bonked into something
                    break;
                }
            }
        }
        if (bonkPos != -1) {
            finalPos = bonkPos - 1;
            this.speed = 0;
        } else {
            finalPos = this.posY + this.speed;
        }
        this.physicsBlocksFallen = finalPos - this.posY;
        this.posY = Math.floor(finalPos);
        return true;
    }

}

class BlockSquare extends BaseSquare {
    constructor(sizeX, sizeY, posX, posY) {
        super(sizeX, sizeY, posX, posY);
        var numb = String(randNumber(10, 99));
        this.color = numb + numb + numb;
        // this.color = "000100";
    }
}

class StaticSquare extends BaseSquare {
    constructor(sizeX, sizeY, posX, posY) {
        super(sizeX, sizeY, posX, posY);
        this.color = "000100";
        this.physicsEnabled = false;
    }
}

var ALL_SQUARES = [];

function addSquare(square) {
    if (getSquare(square.posX, square.posY) != null) {
        console.warn("Square not added; coordinates occupied.");
        return false;
    }
    ALL_SQUARES.push(square);
    return square;
}

function getSquare(posX, posY) {
    posX = Math.floor(posX);
    posY = Math.floor(posY);
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        if (ALL_SQUARES[i].posX == posX && ALL_SQUARES[i].posY == posY) {
            return ALL_SQUARES[i];
        }
    }
    return null;
}
function reset() {
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        ALL_SQUARES[i].reset();
    }
    ALL_SQUARES.sort((a, b) => b.posY - a.posY);
}

function render() {
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        ALL_SQUARES[i].render();
    }
}
function physics() {
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        ALL_SQUARES[i].physics();
        ALL_SQUARES[i].physics();
        ALL_SQUARES[i].physics();
    }

}

function main() {
    MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
    reset();
    physics();
    render();
    doClickAdd();
}

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new StaticSquare(1, 1, i, CANVAS_SQUARES_Y - 1));
}

for (let i = 0; i < 5000; i++) {
    addSquare(new BlockSquare(1, 1,
        randNumber(0, CANVAS_SQUARES_X),
        randNumber(0, CANVAS_SQUARES_Y - 2)));
}

function randNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function handleClick(event) { 
    lastClickEvent = event;
}

function doClickAdd() {
    if (lastClickEvent == null) {
        return; 
    }
    console.log(mouseDown);

    if (mouseDown > 0) {
        var offsetX = lastClickEvent.offsetX / BASE_SIZE;
        var offsetY = lastClickEvent.offsetY / BASE_SIZE;
        switch (selectedMaterial) {
            case "static":
                addSquare(new StaticSquare(1, 1, offsetX, offsetY));
                break;
            case "block":
                addSquare(new BlockSquare(1, 1, offsetX, offsetY));
                break;
        }
    }
}

setInterval(main, 1);

// setTimeout(() => window.location.reload(), 3000);
