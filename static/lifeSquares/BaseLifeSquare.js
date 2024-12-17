import  {MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE} from "../index.js";
import { hexToRgb, rgbToHex } from "../common.js";

import { getCurTime } from "../globals.js";

class BaseLifeSquare {
    constructor(posX, posY) {
        this.proto = "BaseLifeSquare";
        this.posX = posX;
        this.posY = posY;
        this.type = "base";
        this.colorBase = "#1D263B";
        this.spawnedEntityId = 0;
        this.lastUpdateTime = getCurTime()
        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.rootNutrients = 0;
        this.linkedSquare = null;
        this.opacity = 1;
    }

    tick() {
        this.lastUpdateTime = getCurTime()
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
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }

    setSpawnedEntityId(id) {
        this.spawnedEntityId = id;
        if (this.linkedSquare != null) {
            this.linkedSquare.spawnedEntityId = id;
        }
    }

}
export {BaseLifeSquare}