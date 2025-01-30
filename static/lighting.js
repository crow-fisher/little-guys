import { CANVAS_SQUARES_X } from "./index.js";


var lifeSquarePositions = new Map();

const lightingSqSize = 2;

export function lightingClearLifeSquarePositionMap() {
    lifeSquarePositions = new Map();
}

export function lightingRegisterLifeSquare(lifeSquare) {
    if (lifeSquare.type != "green") {
        return;
    }
    var posX = Math.floor(lifeSquare.getPosX() / lightingSqSize);
    var posY = Math.floor(lifeSquare.getPosY() / lightingSqSize);

    if (!(posX in lifeSquarePositions)) {
        lifeSquarePositions[posX] = new Map();
    }
    if (!(posY in lifeSquarePositions[posX])) {
        lifeSquarePositions[posX][posY] = new Array();
    }
    lifeSquarePositions[posX][posY].push(lifeSquare);
}

export class LightSource {
    constructor(posX, posY, brightness, color) {
        this.posX = posX / lightingSqSize;
        this.posY = posY / lightingSqSize;
        this.brightness = brightness;
        this.color = color;
        
        this.frameLifeSquares = null;
    }

    preprocessLifeSquares() {
        this.frameLifeSquares = new Map();
        var posXKeys = Object.keys(lifeSquarePositions);
        posXKeys.forEach((lsqPosX) => {
            var posX = Math.floor(this.posX - lsqPosX);
            var posYKeys = Object.keys(lifeSquarePositions[lsqPosX]);
            posYKeys.forEach((lsqPosY) => {
                var posY = Math.floor(this.posY - lsqPosY);
                if (!(posX in this.frameLifeSquares)) {
                    this.frameLifeSquares[posX] = new Map();
                }
                if (!(posY in this.frameLifeSquares[posX])) {
                    this.frameLifeSquares[posX][posY] = new Array();
                }
                this.frameLifeSquares[posX][posY].push(...lifeSquarePositions[lsqPosX][lsqPosY]);
            })
        })
    }

    doRayCasting() {
        this.preprocessLifeSquares();
        var seenBlockMap = new Set();
        var numRays = 100;
        for (let theta = 0; theta < Math.PI; theta += (Math.PI / numRays)) {
            var curBrightness = this.brightness;
            for (let curRayLength = 0; curRayLength < 100; curRayLength += 0.5) {
                var curPosX = Math.floor((this.posX + Math.cos(theta) * curRayLength) / lightingSqSize);
                var curPosY = Math.floor((this.posY + Math.sin(theta) * curRayLength) / lightingSqSize);

                if (!(curPosX in lifeSquarePositions)) {
                    continue;
                }
                if (!(curPosY in lifeSquarePositions[curPosX])) {
                    continue;
                }

                var lsqs = lifeSquarePositions[curPosX][curPosY];

                lsqs.forEach((lsq) => lsq.lighting = curBrightness);
                curBrightness -= lsqs.map((lsq) => 0.03).reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );
            }
        }
    }
}