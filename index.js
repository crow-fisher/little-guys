var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');

var materialSelect = document.getElementById("materialSelect");

var selectedMaterial = "dirt";

materialSelect.addEventListener('change', (e) => selectedMaterial = e.target.value);
MAIN_CANVAS.addEventListener('mousemove', handleClick, false);

var mouseDown = 0;
var lastClickEvent = null;
var lastTick = Date.now();

document.body.onmousedown = function () {
    mouseDown = 1;
}
document.body.onmouseup = function () {
    mouseDown = 0;
}

// each square is 16x16
// 'little guys' may aquire multiple squares
const BASE_SIZE = 8;
const MILLIS_PER_TICK = 2;
var CANVAS_SQUARES_X = 256
var CANVAS_SQUARES_Y = 128;

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

var ALL_SQUARES = {}
var DIRTY_SQUARES = [];
var NEXT_DIRTY_SQUARES = [];

class BaseSquare {
    constructor(posX, posY) {
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.colorBase = "#A1A6B4";
        this.solid = true;
        // block properties - overridden by block type
        this.physicsEnabled = true;
        this.blockHealth = 1; // when reaches zero, delete
        // water flow parameters
        this.waterContainment = 0;
        this.waterContainmentMax = 0.5;
        this.waterContainmentFillRate = 0.25;
        this.waterContainmentTransferRate = 0.05; // what fraction of ticks does it trigger percolate on

        this.evaporationRate = 0;
        this.falling = false;
        this.speed = 0;
        this.physicsBlocksFallen = 0;
    };
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }
        this.physicsBlocksFallen = 0;
        this.speed += 1;
    }
    render() {
        MAIN_CONTEXT.fillStyle = this.calculateColor();
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = 0.3;

        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.
        var waterColor255 = (1 - (this.waterContainment / this.waterContainmentMax )) * 255;
        var darkeningColorRGB = {r: waterColor255, b: waterColor255, g: waterColor255};
        
        ['r', 'g', 'b'].forEach((p) => {
            darkeningColorRGB[p] *= darkeningStrength;
            baseColorRGB[p] *= (1 - darkeningStrength);
        });

        var resColor = {
            r: darkeningColorRGB.r + baseColorRGB.r,
            g: darkeningColorRGB.g + baseColorRGB.g,
            b: darkeningColorRGB.b + baseColorRGB.b
        }

        return rgbToHex(Math.floor(resColor.r), Math.floor(resColor.g), Math.floor(resColor.b));

    }
    updatePosition(newPosX, newPosY) {
        newPosX = Math.floor(newPosX);
        newPosY = Math.floor(newPosY);

        ALL_SQUARES[this.posX][this.posY] = null;
        ALL_SQUARES[newPosX][newPosY] = this;
        this.posX = newPosX;
        this.posY = newPosY;
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
        this.updatePosition(this.posX, finalPos);
        markDirtySquare(this);
        return true;
    }

    percolateDown() {
        var blockHealthCost = 0;
        var startContainment = this.waterContainment;
        if (this.waterContainment < this.waterContainmentMax) {
            this.waterContainment += this.waterContainmentFillRate;
        }
        blockHealthCost += this.waterContainment - startContainment;
        var next = getSquare(this.posX, this.posY + 1);
        var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate;
        if (next == null) {
            if (Math.random() > (1 - (percolateProbability / 2))) {
                markDirtySquare(this);
                return blockHealthCost + (addSquare(new WaterSquare(this.posX, this.posY + 1)) != null ? 1 : 0);
            }
            return blockHealthCost;
        }
        if (next.solid) {
            if (Math.random() > (1 - percolateProbability)) {
                markDirtySquare(this);
                return blockHealthCost + next.percolateDown();
            }
        }
        return blockHealthCost;
    }

    percolateSide(dir) {
        var blockPercolateCost = 0;
        var startContainment = this.waterContainment;
        if (this.waterContainment < this.waterContainmentMax) {
            this.waterContainment += this.waterContainmentFillRate;
        }
        blockPercolateCost += this.waterContainment - startContainment;

        var next = getSquare(this.posX + dir, this.posY);
        var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate;

        if (next == null) {
            if (Math.random() > (1 - (percolateProbability / 2))) {
                markDirtySquare(this);
                return blockPercolateCost + addSquare(new WaterSquare(this.posX + dir, this.posY));
            }
            return blockPercolateCost;
        }
        if (next.solid) {
            if (Math.random() > (1 - percolateProbability)) {
                markDirtySquare(this);
                return blockPercolateCost + next.percolateSide(dir);
            }
            return blockPercolateCost;
        }
    }

    isDirty() {
        return false;
    }

}

class DirtSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#B06C49";
    }
}

class StaticSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#000100";
        this.physicsEnabled = false;
        this.waterContainmentMax = 0;
        this.waterContainmentFillRate = 0;
        this.waterContainmentTransferRate = 0;
    }
}

class RainSquare extends StaticSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#AAAAAA";
    }
    physics() {
        if (Math.random() > 0.999) {
            addSquare(new WaterSquare(this.posX, this.posY + 1));
        }
    }
}

class WaterSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        var numb1 = randNumber(50, 99);
        var numb2 = Math.min(99, numb1 * 3);
        this.colorBase = String(numb1) + String(numb1) + String(numb2);
        this.solid = false;
        this.evaporationRate = 0.0001;
    }

    isDirty() {
        return true;
    }

    physics() {
        super.physics();
        this.pressurePhysics();
    }

    pressurePhysics() {
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
        } else {
            // Evaporation! 
            if (Math.random() > 0.5) {
                this.blockHealth -= this.evaporationRate; 
            }
        }

        // check if we have a solid block directly below us and percolate it if we do 
        var below = getSquare(this.posX, this.posY + 1);
        if (below == null) {
            return;
        }
        if (below.solid) {
            this.blockHealth -= below.percolateDown();
        }
    }

    flowSide(dir) {
        var nextSq = getSquare(this.posX + dir, this.posY);
        if (nextSq == null) {
            this.updatePosition(this.posX + dir, this.posY);
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
    if (!square.posX in ALL_SQUARES) {
        ALL_SQUARES[square.posX] = {};
    }
    ALL_SQUARES[square.posX][square.posY] = square;

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
    if (!(posX in ALL_SQUARES)) {
        ALL_SQUARES[posX] = {};
    }
    return ALL_SQUARES[posX][posY];
}

function removeSquare(square) {
    ALL_SQUARES[square.posX][square.posY] = null;
}

function reset() {
    var iterDirtykeys = [];
    iterateOnSquares((sq) => {
        sq.reset();
        if (sq.isDirty()) {
            iterDirtykeys.push(sq);
        }
    });
    DIRTY_SQUARES = [...new Set(NEXT_DIRTY_SQUARES.concat(iterDirtykeys))];
    NEXT_DIRTY_SQUARES = [];
    visitedBlockCount = {};
}

function render() {
    iterateOnSquares((sq) => sq.render());
}
function physics() {
    iterateOnSquares((sq) => sq.physics());
}

/**
 * @param {function} func - function with an argumnet of the square it should do the operation on  
 */
function iterateOnSquares(func) {
    var rootKeys = Object.keys(ALL_SQUARES);
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_SQUARES[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            var sq = ALL_SQUARES[rootKeys[i]][subKeys[j]];
            if (sq != null) {
                func(sq);
            }
        }
    }
}
function purge() {
    iterateOnSquares((sq) => {
        var ret = true;
        ret &= sq.posX > 0;
        ret &= sq.posX < CANVAS_SQUARES_X;
        ret &= sq.posY > 0;
        ret &= sq.posY < CANVAS_SQUARES_Y;
        if (!ret) {
            removeSquare(sq);
        }
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
            case "rain":
                addSquare(new RainSquare(offsetX, offsetY));
                break;
        }
    }
}


function randDirection() {
    return Math.random() > 0.5 ? 1 : -1
}

// thanks https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

setInterval(main, 1);

// setTimeout(() => window.location.reload(), 3000);
