var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');
var materialSelect = document.getElementById("materialSelect");
var fastTerrain = document.getElementById("fastTerrain");

var selectedMaterial = "static";

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
var MILLIS_PER_TICK = 2;
var CANVAS_SQUARES_X = 60; //6;
var CANVAS_SQUARES_Y = 80; // 8;
var ERASE_RADIUS = 2;
var lastLastClickEvent = null;

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

var stats = new Map();
var statsLastUpdatedTime = 0;
var NUM_GROUPS = 0;
var ALL_SQUARES = new Map();
var DIRTY_SQUARES = [];
var NEXT_DIRTY_SQUARES = [];

var WATERFLOW_TARGET_SQUARES = new Set();
var WATERFLOW_CANDIDATE_SQUARES = new Set();

var rightMouseClicked = false;

function handleMouseDown(e) {
  //e.button describes the mouse button that was clicked
  // 0 is left, 1 is middle, 2 is right
  if (e.button === 2) {
    rightMouseClicked = true;
  } else if (e.button === 0) {  
    //Do something if left button was clicked and right button is still pressed
    if (rightMouseClicked) {
      console.log('hello');
      //code
    }
  }
}

function handleMouseUp(e) {
  if (e.button === 2) {
    rightMouseClicked = false;
  }
}

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});


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
        this.waterContainmentMax = 0.75;
        this.waterContainmentFillRate = 0.05;
        this.waterContainmentTransferRate = 0.8; // what fraction of ticks does it trigger percolate on
        this.waterContainmentEvaporationRate = 0.0005; // what fraction of contained water will get reduced per tick
        this.evaporationRate = 0;
        this.falling = false;
        this.speed = 0;
        this.physicsBlocksFallen = 0;

        this.group = -1;
    };
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }
        this.physicsBlocksFallen = 0;
        this.group = -1;
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
        var existingSq = getSquare(newPosX, newPosY);
        if (existingSq) {
            return false;
        } else {
            ALL_SQUARES[this.posX][this.posY] = null;
            ALL_SQUARES[newPosX][newPosY] = this;
            this.posX = newPosX;
            this.posY = newPosY;
            return true;
        }
    }

    calculateGroup() {
        if (this.group != -1) {
            return;
        }
        var groupNeighbors = new Set(getNeighbors(this.posX, this.posY).filter((sq) => sq != null && this.colorBase == sq.colorBase));
        groupNeighbors.add(this);
        while (true) {
            var startGroupNeighborsSize = groupNeighbors.size;
            groupNeighbors.forEach((neighbor) => {
                var neighborGroupNeighbors = new Set(getNeighbors(neighbor.posX, neighbor.posY).filter((sq) => sq != null && this.colorBase == sq.colorBase));
                neighborGroupNeighbors.forEach((neighborGroupNeighbor) => groupNeighbors.add(neighborGroupNeighbor))
            })
            var endGroupNeighborsSize = groupNeighbors.size;
            if (startGroupNeighborsSize == endGroupNeighborsSize) {
                break;
            }   
        }

        var group = Array.from(groupNeighbors).map((x) => x.group).find((x) => x != -1);
        if (group != null) {
            // then we have already set this group, somehow
            // probably some physics shenanigans
            groupNeighbors.forEach((x) => x.group = group);
            this.group = group;
            return;
        }

        var nextGroupId = getNextGroupId();
        groupNeighbors.forEach((x) => x.group = nextGroupId);

    }

    // Returns true if something happened.
    // Keep looping on physics until all are false.
    physics() {
        this.evaporateInnerMoisture();
        this.calculateGroup();

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

    percolateUp() {
        var blockHealthCost = 0;
        var startContainment = this.waterContainment;
        if (this.waterContainment < this.waterContainmentMax) {
            this.waterContainment += this.waterContainmentFillRate;
        }
        blockHealthCost += this.waterContainment - startContainment;
        var next = getSquare(this.posX, this.posY - 1);
        var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate;
        if (next == null) {
            if (Math.random() > (1 - (percolateProbability / 2))) {
                markDirtySquare(this);
                return blockHealthCost + (addSquare(new WaterSquare(this.posX, this.posY - 1)) != null ? 1 : 0);
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

    evaporateInnerMoisture() {
        if (this.waterContainment == 0) {
            return;
        }
        if (this.boundedTop) {
            return;
        }

        var pressureTop = 0;
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

        if (Math.random() > (1 - this.waterContainmentEvaporationRate / 2 ** pressureTop)) {
            this.waterContainment = Math.max(0, this.waterContainment - this.waterContainmentTransferRate);
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

class DrainSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#000500";
        this.physicsEnabled = false;
        this.waterContainmentMax = 100;
        this.waterContainmentFillRate = 1;
        this.waterContainmentTransferRate = 1;
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
class HeavyRainSquare extends StaticSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#FFAAAA";
    }
    physics() {
        if (Math.random() > 0.98) {
            addSquare(new WaterSquare(this.posX, this.posY + 1));
        }
    }
}

class WaterSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.boundedTop = false;
        this.colorBase = "#79beee";
        this.solid = false;
        this.evaporationRate = 0;
        this.viscocity = 0.8;

        this.currentPressureDirect = 0;
        this.currentPressureIndirect = 0;
    }

    reset() {
        super.reset();
        this.currentPressureDirect = 0;
        this.currentPressureIndirect = 0;
    }

    isDirty() {
        return true;
    }

    physics() {
        super.physics();
        this.pressurePhysics();
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = 0.3;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.
        
        var num = this.currentPressureIndirect;
        var numMax = getGlobalStatistic("pressure") + 1;
        
        var featureColor255 = (1 - (num / numMax )) * 255;
        var darkeningColorRGB = {r: featureColor255, b: featureColor255, g: featureColor255};
        
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

    pressurePhysics() {
        if (getSquare(this.posX, this.posY + 1) == null) {
            return;
        }
        this.calculatePressures();
        this.calculateCandidateFlows();
    }

    calculateCandidateFlows() {
        var neighbors = getNeighbors(this.posX, this.posY);
        if (this.currentPressureIndirect == 0) {
            WATERFLOW_CANDIDATE_SQUARES.add(this);
            for (let i = 0; i < neighbors.length; i++) {
                var sq = neighbors[i];
                if (sq == null || sq.solid) {
                    continue;
                }
                if (sq.currentPressureIndirect == 0) {
                    WATERFLOW_CANDIDATE_SQUARES.add(sq);
                }
            }
        }
        if (this.currentPressureIndirect >= this.currentPressureDirect) {
            for (var i = -1; i < 2; i++) {
                for (var j = -1; j < 2; j++) {
                    if (i == 0 && j == 0) {
                        continue;
                    }
                    var sq = getSquare(this.posX + i, this.posY + j);
                    if (sq == null) {
                        WATERFLOW_TARGET_SQUARES.add([this.posX + i, this.posY + j, this.group]);
                    }
                }
            }
        }
    }

    calculatePressures() {
        this.calculateDirectPressure();
        this.calculateIndirectPressure();
        updateGlobalStatistic("pressure", this.currentPressureIndirect);
    }

    /**
     * Direct pressure is how many blocks of water are directly above us. 
     */
    calculateDirectPressure() {
        this.currentPressureDirect = 0;
        var curY = this.posY - 1;
        while (true) {
            var sq = getSquare(this.posX, curY);
            if (sq == null) {
                break;
            }
            if (sq.solid) {
                break;
            }
            curY -= 1;
            this.currentPressureDirect += 1;
        }
    }
    calculateIndirectPressure() {
        this.currentPressureIndirect = this.currentPressureDirect;
        var neighbors = getNeighbors(this.posX, this.posY);
        for (let i = 0; i < neighbors.length; i++) {
            var sq = neighbors[i];
            if (sq == null || sq.solid) {
                continue;
            }
            this.currentPressureIndirect = Math.max(
                this.currentPressureIndirect,
                sq.currentPressureIndirect + (this.posY - sq.posY)
            ); 
        }
    }
}

function getNeighbors(x, y) {
    var out = [];
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            out.push(getSquare(x + i, y + j));
        }
    }
    return out;
}


function addSquare(square) {
    if (getSquare(square.posX, square.posY) != null) {
        console.warn("Square not added; coordinates occupied.");
        return false;
    }
    if (!square.posX in ALL_SQUARES) {
        ALL_SQUARES[square.posX] = new Map();
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

function removeSquarePos(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (getSquare(x, y) != null) {
        removeSquare(getSquare(x, y));

    }
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
    stats["pressure"] = 0;
    WATERFLOW_TARGET_SQUARES = new Set();
    WATERFLOW_CANDIDATE_SQUARES = new Set();
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
    var squareOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_SQUARES[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            var sq = ALL_SQUARES[rootKeys[i]][subKeys[j]];
            if (sq != null) {
                squareOrder.push(sq);
                // func(sq);
            }
        }
    }
    squareOrder.sort((a, b) => (Math.random() > 0.01 ? b.posY - a.posY : a.posY - b.posY));
    squareOrder.forEach(func);
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

function doWaterFlow() {
    if (WATERFLOW_CANDIDATE_SQUARES.size > 0 && WATERFLOW_TARGET_SQUARES.size > 0) {
        // we need to do some water-mcflowin!
        var candidate_squares_as_list = Array.from(WATERFLOW_CANDIDATE_SQUARES);
        var target_squares_as_list = Array.from(WATERFLOW_TARGET_SQUARES);
        target_squares_as_list.sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < Math.min(candidate_squares_as_list.length, target_squares_as_list.length); i++) {
            var candidate = candidate_squares_as_list[i];
            var target = target_squares_as_list[i];
            if (candidate.group == target[2]) {
                if (Math.random() > (1 - candidate.viscocity)) {
                    candidate.updatePosition(target[0], target[1]);
                }
            }
        }
    }
}

function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
        reset();
        doClickAdd();
        physics();
        doWaterFlow();
        purge();
        render();
        lastTick = Date.now();
    }
}


function randNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function handleClick(event) {
    lastClickEvent = event;
    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastClickEvent = event;
    }
}

function doClickAdd() {
    if (lastClickEvent == null) {
        return;
    }
    if (mouseDown > 0) {
        var offsetX = lastClickEvent.offsetX / BASE_SIZE;
        var offsetY = lastClickEvent.offsetY / BASE_SIZE;
        var prevOffsetX = (lastLastClickEvent == null ? lastClickEvent : lastLastClickEvent).offsetX / BASE_SIZE;
        var prevOffsetY = (lastLastClickEvent == null ? lastClickEvent : lastLastClickEvent).offsetY / BASE_SIZE;

        // point slope motherfuckers 

        var x1 = prevOffsetX;
        var x2 = offsetX;
        var y1 = prevOffsetY; 
        var y2 = offsetY;

        var dx = x2 - x1; 
        var dy = y2 - y1;
        var dz = Math.pow(dx ** 2 + dy ** 2, 0.5);
    
        var totalCount = Math.max(1, Math.round(dz));
        var ddx = dx / totalCount;
        var ddy = dy / totalCount; 
        for (let i = 0; i < totalCount; i++) {
            var px = x1 + ddx * i;
            var py = y1 + ddy * i;
            for (let i = 0; i < (CANVAS_SQUARES_Y - offsetY); i++) {
                var curY = py + i;
                if (rightMouseClicked) {
                    doErase(px, curY);
                    break;
                } else {
                    switch (selectedMaterial) {
                        case "static":
                            addSquare(new StaticSquare(px, curY));
                            break;
                        case "dirt":
                            addSquare(new DirtSquare(px, curY));
                            break;
                        case "water":
                            addSquare(new WaterSquare(px, curY));
                            break;
                        case "rain":
                            addSquare(new RainSquare(px, curY));
                            break;
                        case "heavy rain":
                            addSquare(new HeavyRainSquare(px, curY));
                            break;
                        case "drain":
                            addSquare(new DrainSquare(px, curY));
                            break;
                    }
                }
                if (!fastTerrain.checked) {
                    break;
                }
            }
        }
        lastLastClickEvent = lastClickEvent;
    }
}

function doErase(x, y) {
    var workingEraseRadius = ERASE_RADIUS * 2 + 1;
    // it has to be an odd number
    // we make a cross like thing
    var start = (workingEraseRadius + 1) / 2;
    for (var i = -start; i < start; i++) {
        for (var j = -start; j < start; j++) {
            removeSquarePos(x + i, y + j);
        }
    }
}

function getNextGroupId() {
    NUM_GROUPS += 1;
    return NUM_GROUPS;
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

function updateGlobalStatistic(name, value) {
    if (name in stats) {
        if (value > (stats[name]) ) {
            stats[name] = value;
        }
    }
}
function getGlobalStatistic(name) { 
    if (!name in stats) {
        console.warn("getGlobalStatistic miss for ", name)
        return -1;
    }
    return stats[name];
}

  

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new StaticSquare(i, CANVAS_SQUARES_Y - 1));
}

setInterval(main, 1);

// setTimeout(() => window.location.reload(), 3000);
window.oncontextmenu = function () {
    return false;     // cancel default menu
  }
