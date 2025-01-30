import { CANVAS_SQUARES_X } from "./index.js";


var lifeSquarePositions = new Map();

const lightingSqSize = 3;

export function lightingClearLifeSquarePositionMap() {
    lifeSquarePositions = new Map();
}

export function lightingRegisterLifeSquare(lifeSquare) {
    if (lifeSquare.type != "green") {
        return;
    }
    var posX = Math.floor(lifeSquare.getPosX());
    var posY = Math.floor(lifeSquare.getPosY());

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
        this.posX = posX;
        this.posY = posY;
        this.brightness = brightness;
        this.color = color;
    }

    doRayCasting() {
        var seenBlockMap = new Set();
        var numRays = 100;
        for (let theta = 0; theta < Math.PI; theta += (Math.PI / numRays)) {
            var curBrightness = this.brightness;
            for (let curRayLength = 0; curRayLength < 100; curRayLength += 0.5) {
                var curPosX = Math.floor(this.posX + Math.cos(theta) * curRayLength);
                var curPosY = Math.floor(this.posY + Math.sin(theta) * curRayLength);

                if (!(curPosX in lifeSquarePositions)) {
                    continue;
                }
                if (!(curPosY in lifeSquarePositions[curPosX])) {
                    continue;
                }

                var lsqs = lifeSquarePositions[curPosX][curPosY];

                lsqs.forEach((lsq) => lsq.lighting = curBrightness);
                curBrightness -= lsqs.map((lsq) => 0.1).reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );
            }
        }
    }
    


}