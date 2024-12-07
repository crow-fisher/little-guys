var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');
var materialSelect = document.getElementById("materialSelect");
var fastTerrain = document.getElementById("fastTerrain");

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
var MILLIS_PER_TICK = 2;
var CANVAS_SQUARES_X = 15; // * 8; //6;
var CANVAS_SQUARES_Y = 8; // * 8; // 8;
var ERASE_RADIUS = 2;
var lastLastClickEvent = null;

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

var stats = new Map();
var statsLastUpdatedTime = 0;
var NUM_GROUPS = 0;
var ALL_SQUARES = new Map();
var ALL_ORGANISMS = new Array();
var ALL_ORGANISM_SQUARES = new Map();

var WATERFLOW_TARGET_SQUARES = new Map();
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
document.addEventListener('contextmenu', function (e) {
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
        this.waterContainmentMax = 0.2;
        this.waterContainmentTransferRate = 0.3; // what fraction of ticks does it trigger percolate on
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
        var waterColor255 = (1 - (this.waterContainment / this.waterContainmentMax)) * 255;
        var darkeningColorRGB = { r: waterColor255, b: waterColor255, g: waterColor255 };

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
        this.percolateInnerMoisture();

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
        return true;
    }

    /* Called before physics(), with blocks in strict order from top left to bottom right. */
    physicsBefore() {
        this.calculateGroup();
    }

    /* god i fucking hate water physics */
    physicsBefore2() { }

    percolateFromBlock(otherBlockMoisture) {
        var moistureDiff = otherBlockMoisture - this.waterContainment;
        if (moistureDiff < 0) {
            return 0; // wet things get other things wet; dry things do not get other things dry 
        }

        if (Math.random() > (1 - this.waterContainmentTransferRate)) {
            var nextWaterContainment = Math.min(this.waterContainmentMax, this.waterContainment + moistureDiff / 2);
            var dw = nextWaterContainment - this.waterContainment;
            this.waterContainment = nextWaterContainment;
            return dw;
        }
        return 0;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }
        var directNeighbors = getDirectNeighbors(this.posX, this.posY).filter((sq) => sq != null && sq.solid);

        directNeighbors.forEach((sq) => {
            var percolateProbability = (this.waterContainment / this.waterContainmentMax) * this.waterContainmentTransferRate;
            if (Math.random() > (1 - (percolateProbability / 2))) {
                this.waterContainment -= sq.percolateFromBlock(this.waterContainment);
            }
        });
    }

    evaporateInnerMoisture() {
        if (this.waterContainment == 0) {
            return;
        }

        var airCounter = getDirectNeighbors(this.posX, this.posY).map((sq) => (sq == null ? 1 : 0)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        for (let i = 0; i < airCounter; i++) {
            if (Math.random() > (1 - this.waterContainmentTransferRate)) {
                this.waterContainment = Math.max(0, this.waterContainment - this.waterContainmentEvaporationRate);
            }
        }
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
        this.waterContainmentTransferRate = 0;
    }
}

class DrainSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#555555";
        this.physicsEnabled = false;
        this.waterContainmentMax = 1.01;
        this.waterContainmentTransferRate = 0.5;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                if (abs(i) == abs(j)) {
                    continue;
                }
                if (this.waterContainment >= 1) {
                    if (addSquare(new WaterSquare(this.posX + i, this.posY + j))) {
                        this.waterContainment -= 1;
                    }
                }
            }
        }
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }
}

class WaterDistributionSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.colorBase = "#000500";
        this.physicsEnabled = false;
        this.waterContainmentMax = 2;
        this.waterContainmentTransferRate = 1;
    }
    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }
        var neighbors = getNeighbors(this.posX, this.posY).filter((sq) => sq != null && sq.solid);

        neighbors.forEach((sq) => {
            this.waterContainment -= sq.percolateFromBlock(this.waterContainment);
        });
    }


    percolateFromBlock(otherBlockMoisture) {
        var moistureDiff = otherBlockMoisture - this.waterContainment;
        if (moistureDiff < 0) {
            return 0; // wet things get other things wet; dry things do not get other things dry 
        }

        var nextWaterContainment = Math.min(this.waterContainmentMax, this.waterContainment + moistureDiff / 2);
        var dw = nextWaterContainment - this.waterContainment;
        this.waterContainment = nextWaterContainment;
        return dw;
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
        this.viscocity = 0.1;

        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;
    }

    reset() {
        super.reset();
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;
    }

    physics() {
        super.physics();
        this.calculateCandidateFlows();
        this.doNeighborPercolation();
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = 0.3;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.

        var num = this.currentPressureIndirect;
        var numMax = getGlobalStatistic("pressure") + 1;

        var featureColor255 = (1 - (num / numMax)) * 255;
        var darkeningColorRGB = { r: featureColor255, b: featureColor255, g: featureColor255 };

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

    physicsBefore() {
        super.physicsBefore();
        this.calculateDirectPressure();
    }

    physicsBefore2() {
        super.physicsBefore2();
        this.calculateIndirectPressure(0);
        updateGlobalStatistic("pressure", this.currentPressureIndirect);
    }

    calculateCandidateFlows() {
        if (this.currentPressureIndirect == 0) {
            WATERFLOW_CANDIDATE_SQUARES.add(this);
        }
        if (this.currentPressureIndirect >= this.currentPressureDirect) {
            for (var i = -1; i < 2; i++) {
                for (var j = (this.currentPressureIndirect > 2 ? -1 : 0); j < 2; j++) {
                    if (Math.abs(i) == Math.abs(j)) {
                        continue;
                    }
                    if (getSquare(this.posX + i, this.posY + j) == null) {
                        if (!(this.currentPressureIndirect in WATERFLOW_TARGET_SQUARES)) {
                            WATERFLOW_TARGET_SQUARES[this.currentPressureIndirect] = new Array();
                        }
                        WATERFLOW_TARGET_SQUARES[this.currentPressureIndirect].push([this.posX + i, this.posY + j, this.group]);
                    }
                }
            }
        }
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
    calculateIndirectPressure(startingPressure) {
        // we are looking for neighbors *of the same group*. 
        // we will only do this calculation *once* per group. 
        // starting on the top left member of that group.
        if (this.currentPressureIndirect != -1) {
            return;
        }
        var myNeighbors = Array.from(getNeighbors(this.posX, this.posY)
            .filter((sq) => sq != null && sq.group == this.group));

        this.currentPressureIndirect = Math.max(this.currentPressureDirect, startingPressure);
        for (let i = 0; i < myNeighbors.length; i++) {
            var myNeighbor = myNeighbors[i];
            var dy = myNeighbor.posY - this.posY;
            myNeighbor.calculateIndirectPressure(startingPressure + dy);
        }
    }

    doNeighborPercolation() {
        var upSquare = getSquare(this.posX, this.posY - 1);
        if (upSquare != null && upSquare.solid) {
            this.blockHealth -= upSquare.percolateFromBlock(upSquare.waterContainmentMax);
        }
        for (let i = -1; i < 2; i += 2) {
            var sq = getSquare(this.posX + i, this.posY);
            if (sq != null && sq.solid) {
                this.blockHealth -= sq.percolateFromBlock(sq.waterContainmentMax);
            }
        }
        var downSquare = getSquare(this.posX, this.posY + 1);
        if (downSquare != null && downSquare.solid) {
            this.blockHealth -= downSquare.percolateFromBlock(downSquare.waterContainmentMax);
        }
    }
}

class BaseLifeSquare {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.type = "base";
    }

    tick() {}

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
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }

}

class BaseOrganism {
    constructor(posX, posY) {
        this.posX = Math.floor(posX); 
        this.posY = Math.floor(posY);
        this.associatedSquares = new Array();
        this.type = "base";
        this.valid = false;
        var initialSquare = this.getInitialSquare();
        if (initialSquare) {
            addOrganismSquare(initialSquare);
            this.associatedSquares.push(initialSquare);
            this.valid = true;
        }
    }

    getInitialSquare() {}

    render() {
        this.associatedSquares.forEach((sp) => sp.render())
    }

    process() {
        this.tick();
        this.postTick();
    }

    tick() {
        this.associatedSquares.forEach((sp) => sp.tick())
    }

    postTick() {}
}


// Organic processing life cycle

/* 

A 'TypeOrganism' has a collection of 'TypeSquares' that are 
its members. 

These can be a variety of subtypes for different functions.

Computationally, organic life does the following: 

* Call 'tick' on all member squares.
* Then, call 'postTick' on itself. 

Inside 'postTick', we make decisions about what to do 
next, such as where to grow or where to die. 

*/

class PlantOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.type = "plant";
    }
    render() {
        this.associatedSquares.forEach((sp) => sp.render())
    }
}

class PlantSeedOrganism extends PlantOrganism {
    constructor(posX, posY) {
        super(posX, posY);
    }
    getInitialSquare() {
        return new PlantSeedSqaure(this.posX, this.posY);
    }

    postTick() {
        if (this.associatedSquares[0].sproutStatus >= 1) {
            // now we need to convert ourself into a 'plant organism'
            ALL_ORGANISMS = Array.from(ALL_ORGANISMS.filter((org) => org != this));
            for (let i = 0; i < this.associatedSquares.length; i++) {
                removeOrganismSquare(this.associatedSquares[i]);
            }
        }
    }
}

class PlantSeedSqaure extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.type = "seed";
        this.sproutStatus = 0;
        this.sproutGrowthRate = 0.01;
        this.neighborWaterContainmentRequiredToGrow = 0.8;
        this.neighborWaterContainmentRequiredToDecay = 0.1;
        this.colorBase = "#EABDA8";
    }

    tick() {
        var hostSquare = getSquare(this.posX, this.posY);
        var directNeighbors = getNeighbors(this.posX, this.posY);

        var totalSurroundingWater = hostSquare.waterContainment;
        for (var i = 0; i < directNeighbors.length; i++) {
            var neighbor = directNeighbors[i];
            if (neighbor == null) {
                continue;
            }
            if (!neighbor.solid) { // basically if it's a water type?? idk maybe this is unclear
                totalSurroundingWater += 1;
                continue;
            }
            totalSurroundingWater += neighbor.waterContainment;
        }
        
        if (totalSurroundingWater < this.neighborWaterContainmentRequiredToDecay) {
            this.sproutStatus -= this.sproutGrowthRate;
        }
        if (totalSurroundingWater > this.neighborWaterContainmentRequiredToGrow) {
            this.sproutStatus += this.sproutGrowthRate;
        }

        this.sproutStatus = Math.max(0, this.sproutStatus);
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = 0.3;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.

        var num = this.sproutStatus;
        var numMax = 1;

        var featureColor255 = (1 - (num / numMax)) * 255;
        var darkeningColorRGB = { r: featureColor255, b: featureColor255, g: featureColor255 };

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


}


// Returns all neighbors (including corners)
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

function getDirectNeighbors(x, y) {
    var out = [];
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            if (abs(i) == abs(j)) {
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
    return square;
}

function addOrganism(organism) {
    if (getSquare(organism.posX, organism.posY) == null) {
        console.warn("Invalid organism placement; no squares to bind to.")
        return false;
    }

    if (organism.valid) {
        ALL_ORGANISMS.push(organism);
    }
}

function addOrganismSquare(organismSqaure) {
    if (getSquare(organismSqaure.posX, organismSqaure.posY) == null) {
        console.warn("Invalid organism placement; no squares to bind to.")
        return false;
    }
    var existingOrganismSquares = getOrganismSquaresAtSquare(organismSqaure.posX, organismSqaure.posY);
    var existingOrganismSquaresOfSameTypeArray = Array.from(existingOrganismSquares.filter((org) => org.type == organismSqaure.type));

    if (existingOrganismSquaresOfSameTypeArray.length > 0) {
        console.warn("Invalid organism placement; already found an organism of this type here.")
        return false;
    }

    if (!(organismSqaure.posX in ALL_ORGANISM_SQUARES)) {
        ALL_ORGANISM_SQUARES[organismSqaure.posX] = new Map();
    }
    if (!(organismSqaure.posY in ALL_ORGANISM_SQUARES[organismSqaure.posX])) {
        ALL_ORGANISM_SQUARES[organismSqaure.posX][organismSqaure.posY] = new Array();
    }
    ALL_ORGANISM_SQUARES[organismSqaure.posX][organismSqaure.posY].push(organismSqaure);
    return organismSqaure;
}

function getSquare(posX, posY) {
    if (!(posX in ALL_SQUARES)) {
        ALL_SQUARES[posX] = new Map();
    }
    return ALL_SQUARES[posX][posY];
}


function getOrganismSquaresAtSquare(posX, posY) {
    if (!(posX in ALL_ORGANISM_SQUARES)) {
        ALL_ORGANISM_SQUARES[posX] = new Map();
    }
    if (!(posY in ALL_ORGANISM_SQUARES[posX])) {
        ALL_ORGANISM_SQUARES[posX][posY] = new Array();
    }

    return ALL_ORGANISM_SQUARES[posX][posY];
}

function removeOrganismSquare(organismSquare) {
    var posX = organismSquare.posX;
    var posY = organismSquare.posY;

    if (!(posX in ALL_ORGANISM_SQUARES)) {
        ALL_ORGANISM_SQUARES[posX] = new Map();
    }
    if (!(posY in ALL_ORGANISM_SQUARES[posX])) {
        ALL_ORGANISM_SQUARES[posX][posY] = new Array();
    }

    ALL_ORGANISM_SQUARES[posX][posY] = Array.from(
        ALL_ORGANISM_SQUARES[posX][posY].filter((osq) => osq != organismSquare))
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
    iterateOnSquares((sq) => {
        sq.reset();
    });
    visitedBlockCount = {};
    stats["pressure"] = 0;
    WATERFLOW_TARGET_SQUARES = new Map();
    WATERFLOW_CANDIDATE_SQUARES = new Set();
}

function render() {
    iterateOnSquares((sq) => sq.render(), 0);
}
function physics() {
    iterateOnSquares((sq) => sq.physics(), 0.1);
}
function physicsBefore() {
    iterateOnSquares((sq) => sq.physicsBefore(), 0);
    iterateOnSquares((sq) => sq.physicsBefore2(), 0);
}

function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

/**
 * @param {function} func - function with an argumnet of the square it should do the operation on  
 */
function iterateOnSquares(func, sortRandomness) {
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
    squareOrder.sort((a, b) => (Math.random() > sortRandomness ? (a.posX + a.posY * 10) - (b.posX + b.posY * 10) : (a.posX + a.posY * 10 - b.posX + b.posY * 10)));
    squareOrder.forEach(func);
}

function iterateOnOrganisms(func, sortRandomness) {
    var organismOrder = ALL_ORGANISMS;
    organismOrder.sort((a, b) => (Math.random() > sortRandomness ? (a.posX + a.posY * 10) - (b.posX + b.posY * 10) : (a.posX + a.posY * 10 - b.posX + b.posY * 10)));
    organismOrder.forEach(func);
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
    });
}

function doWaterFlow() {
    for (let curWaterflowPressure = 0; curWaterflowPressure < getGlobalStatistic("pressure"); curWaterflowPressure++) {
        if (WATERFLOW_CANDIDATE_SQUARES.size > 0) {
            // we need to do some water-mcflowin!
            var candidate_squares_as_list = Array.from(WATERFLOW_CANDIDATE_SQUARES);
            var target_squares = WATERFLOW_TARGET_SQUARES[curWaterflowPressure];
            if (target_squares == null) {
                continue;
            }

            for (let j = 0; j < Math.max(candidate_squares_as_list.length, target_squares.length); j++) {
                var candidate = candidate_squares_as_list[j % candidate_squares_as_list.length];
                var target = target_squares[j % target_squares.length];
                if (candidate.group == target[2]) {
                    if (Math.random() > ((1 - candidate.viscocity) ** (curWaterflowPressure + 1))) {
                        var dx = target[0] - candidate.posX;
                        var dy = target[1] - candidate.posY;
                        if (Math.abs(dy) == 0 && Math.abs(dx) < 5) {
                            continue;
                        }
                        candidate.updatePosition(target[0], target[1]);
                    }
                }
            }
        }
    }
}

function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);

        
        doClickAdd();
        
        // square life cycle
        reset();
        physicsBefore();
        physics();
        doWaterFlow();
        purge();
        render();

        // organism life cycle;
        processOrganisms();
        renderOrganisms();
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
        for (let i = 0; i < totalCount; i += 0.5) {
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
                        case "water distribution":
                            addSquare(new WaterDistributionSquare(px, curY));
                            break;
                        case "drain": 
                            addSquare(new DrainSquare(px, curY));
                            break;

                        // organism sections
                        // in this case we only want to add one per click
                        case "plant":
                            addOrganism(new PlantSeedOrganism(px, curY));
                            return;
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
        if (value > (stats[name])) {
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
    addSquare(new DrainSquare(i, CANVAS_SQUARES_Y - 1));
}


for (let i = 0; i < CANVAS_SQUARES_Y; i++) {
    addSquare(new StaticSquare(CANVAS_SQUARES_X - 1, i));
    addSquare(new StaticSquare(1, i));
}

setInterval(main, 1);

// setTimeout(() => window.location.reload(), 3000);
window.oncontextmenu = function () {
    return false;     // cancel default menu
}

var abs = Math.abs;