var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

var materialSelect = document.getElementById("materialSelect");

var selectedMaterial = "dirt";

materialSelect.addEventListener('change', (e) => selectedMaterial = e.target.value);
MAIN_CANVAS.addEventListener('mousemove', handleClick, false);

var MAX_VISITS = 100;

var mouseDown = 0;
var lastClickEvent = null;
var lastTick = Date.now();

document.body.onmousedown = function() { 
    mouseDown = 1;
}
document.body.onmouseup = function() {
    mouseDown = 0;
}

// each square is 16x16
// 'little guys' may aquire multiple squares
const BASE_SIZE = 8; 
const MILLIS_PER_TICK = 2;
var CANVAS_SQUARES_X = 128
var CANVAS_SQUARES_Y = 64

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

var ALL_SQUARES = [];
var DIRTY_SQUARES = [];
var NEXT_DIRTY_SQUARES = [];

var visitedBlockCount = {}

class BaseSquare {
    constructor(posX, posY) {
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.color = "A1A6B4";
        this.solid = true;
        // block properties - overridden by block type
        this.physicsEnabled = true;

        // water flow parameters
        this.waterContainment = 0;
        this.waterContainmentMax = 0.5;
        this.waterContainmentFillRate = 0.25;
        this.waterContainmentTransferRate = 0.0005; // what fraction of ticks does it trigger percolate on

        this.falling = false;
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

    updatePosition(newPosX, newPosY) {
        
    }
    
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
        markDirtySquare(this);
        return true;
    }
    
    percolateDown() {
        if (this.waterContainment < this.waterContainmentMax) {
            this.waterContainment += this.waterContainmentFillRate;
        }
        var next = getSquare(this.posX, this.posY + 1);
        var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate; 
        if (next == null) {
            if (Math.random() > (1 - (percolateProbability / 2))) {
                markDirtySquare(this);
                return addSquare(new WaterSquare(this.posX, this.posY + 1));
            }
            return false;
        }
        if (next.solid) {
            if (Math.random() > (1 - percolateProbability)) {
                markDirtySquare(this);
                return next.percolateDown();
            }
        }
        return false;
    }

    percolateSide(dir) {
        if (this.waterContainment < this.waterContainmentMax) {
            this.waterContainment += this.waterContainmentFillRate;
        }
        var next = getSquare(this.posX + dir, this.posY);
        var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate; 

        if (next == null) {
            if (Math.random() > (1 - (percolateProbability / 2))) {
                markDirtySquare(this);
                return addSquare(new WaterSquare(this.posX + dir, this.posY));
            }
            return false;
        }
        if (next.solid) {
            if (Math.random() > (1 - percolateProbability)) {
                markDirtySquare(this);
                return next.percolateSide(dir);
            }
        }
        return false;
    }

    isDirty() {
        return false;
    }

}

class DirtSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        var numb1 = String(randNumber(60, 80));
        var numb2 = String(randNumber(25, 35));
        var numb3 = String(randNumber(0, 9));
        this.color = numb1 + numb2 + "0" + numb3;
    }
}

class StaticSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.color = "000100";
        this.physicsEnabled = false;
    }
}

class WaterSquare extends BaseSquare {u
    constructor(posX, posY) {
        super(posX, posY);
        var numb1 = randNumber(50, 99);
        var numb2 = Math.min(99, numb1 * 3);
        this.color = String(numb1) + String(numb1) + String(numb2);
        this.solid = false;
    }

    isDirty() {
        return true;
    }

    physics() {
        super.physics();
        this.calculatePressure();
    }
    
    calculatePressure() {
        // Water model based on pressure. 
        // Top: Count how many blocks of water are above me (non-solid blocks!)
        // Sides: Count how many blocks of water are to the side, OR we hit a 'solid' wall.
        // Remember: bigger number = below.
        var pressureTop = 0;
        var pressureLeft = 0; 
        var pressureRight = 0;

        var testTopIdx = this.posY - 1; 
        while (testTopIdx >= 0) {
            var testSquare = getSquare(this.posX, testTopIdx);
            if (testSquare != null && !testSquare.solid) {
                pressureTop += 1;
                testTopIdx -= 1;
            } else {
                break;
            }
        }

        var testLeftIdx = this.posX - 1;
        while (testLeftIdx >= 0) {
            var testSquare = getSquare(testLeftIdx, this.posY);
            if (testSquare != null) {
                if (testSquare.solid) {
                    pressureLeft = 10 ** 8;
                    break;
                } else {
                    pressureLeft += 1;
                    testLeftIdx -= 1;
                } 
            } else {
                break;
            }
        }
        var testRightIdx = this.posX + 1;
        while (testRightIdx <= CANVAS_SQUARES_X) {
            var testSquare = getSquare(testRightIdx, this.posY);
            if (testSquare != null) {
                if (testSquare.solid) {
                    pressureRight = 10 ** 8;
                    break;
                } else {
                    pressureRight += 1;
                    testRightIdx += 1;
                } 
            } else {
                break;
            }
        }

        if (pressureTop > 0) {
            if (pressureLeft != pressureRight) {
                // now we need to flow either
                if (pressureLeft > pressureRight) {
                        this.flowSide(1);
                } else {
                    this.flowSide(-1);
                }
            } else {
                this.flowSide(randDirection());
            }
        }
        
        // check if we have a solid block directly below us and percolate it if we do 
        var below = getSquare(this.posX, this.posY + 1);
        if (below == null) {
            return;
        }
        if (below.solid) {
            if (below.percolateDown()) {
                removeSquare(this);
            };
        }
    }
    
    flowSide(dir) {
        var nextSq = getSquare(this.posX + dir, this.posY);
        if (nextSq == null) {
            this.posX += dir;
        } else if (nextSq.solid) {
            if (nextSq.percolateSide(dir)) {
                removeSquare(this);
            };
        } else {
            nextSq.flowSide(dir);
        }
    }
}


function addSquare(square) {
    if (getSquare(square.posX, square.posY) != null) {
        console.warn("Square not added; coordinates occupied.");
        return false;
    }
    ALL_SQUARES.push(square);
    markDirtySquare(square);
    return square;
}

function markDirtySquare(square) {
    NEXT_DIRTY_SQUARES.push(square);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            var sq = getSquare(square.posX + i - 2, square.posY + j - 2);
            if (sq == null || sq == square) {
                continue;
            } else {
                NEXT_DIRTY_SQUARES.push(sq);
            }
        }
    }
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

function removeSquare(square) {
    ALL_SQUARES = ALL_SQUARES.filter((el) => el != square);
}

function reset() {
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        ALL_SQUARES[i].reset();
    }
    ALL_SQUARES.sort((a, b) => b.posY - a.posY);
    DIRTY_SQUARES = [...new Set(NEXT_DIRTY_SQUARES.concat(ALL_SQUARES.filter((sq => sq.isDirty()))))];
    NEXT_DIRTY_SQUARES = [];
    visitedBlockCount = {};
}

function render() {
    for (let i = 0; i < ALL_SQUARES.length; i++) {
        ALL_SQUARES[i].render();
    }
}
function physics() {
    for (let i = 0; i < DIRTY_SQUARES.length; i++) {
        DIRTY_SQUARES[i].physics();
    }
}
function purge() {
    ALL_SQUARES = ALL_SQUARES.filter(
            (test) => {
                var ret = true; 
                ret &= test.posX > 0;
                ret &= test.posX < CANVAS_SQUARES_X;
                ret &= test.posY > 0;
                ret &= test.posY < CANVAS_SQUARES_Y;
                return ret;
            }
    );
}

function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
        reset();
        doClickAdd();
        physics();
        purge();
        render();
        lastTick = Date.now();
    }
}

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new StaticSquare(i, CANVAS_SQUARES_Y - 1));
    addSquare(new StaticSquare(i, CANVAS_SQUARES_Y / 2));
}

// for (let i = 0; i < 5000; i++) {
//     addSquare(new BlockSquare(1, 1,
//         randNumber(0, CANVAS_SQUARES_X),
//         randNumber(0, CANVAS_SQUARES_Y - 2)));
// }

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
    if (mouseDown > 0) {
        var offsetX = lastClickEvent.offsetX / BASE_SIZE;
        var offsetY = lastClickEvent.offsetY / BASE_SIZE;
        switch (selectedMaterial) {
            case "static":
                addSquare(new StaticSquare(offsetX, offsetY));
                break;
            case "dirt":
                addSquare(new DirtSquare(offsetX, offsetY));
                break; 
            case "water": 
                addSquare(new WaterSquare(offsetX, offsetY));
                break;
        }
    }
}


function randDirection() {
    return Math.random() > 0.5 ? 1 : -1
}


setInterval(main, 1);

// setTimeout(() => window.location.reload(), 3000);
