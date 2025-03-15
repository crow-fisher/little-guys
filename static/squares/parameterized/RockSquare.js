
import { getSquares } from "../_sqOperations.js";
import { SoilSquare } from "./SoilSquare.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { loadUI, UI_LIGHTING_ROCK, UI_PALETTE_COMPOSITION, UI_PALETTE_ROCKIDX, UI_ROCK_COMPOSITION, UI_SOIL_COMPOSITION } from "../../ui/UIData.js";
import { getCanvasSquaresY } from "../../canvas.js";
import { addSquareByName } from "../../manipulation.js";


export function getBaseRockColor(sand, silt, clay) {
    let clayColorRgb = getActiveClimate().rockColorClay;
    let siltColorRgb = getActiveClimate().rockColorSilt;
    let sandColorRgb = getActiveClimate().rockColorSand;
    return {
        r: clay * clayColorRgb.r + silt * siltColorRgb.r + sand * sandColorRgb.r, 
        g: clay * clayColorRgb.g + silt * siltColorRgb.g + sand * sandColorRgb.g, 
        b: clay * clayColorRgb.b + silt * siltColorRgb.b + sand * sandColorRgb.b
    }
}

export class RockSquare extends SoilSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RockSquare";
        this.gravity = 0;
        this.colorVariant = loadUI(UI_PALETTE_ROCKIDX) % getActiveClimate().soilColors.length;
        this.clayColorRgb = getActiveClimate().rockColorClay;
        this.siltColorRgb = getActiveClimate().rockColorSilt;
        this.sandColorRgb = getActiveClimate().rockColorSand;
    }

    getColorBase() {
        var outColor = getActiveClimate().getBaseRockColor(this.colorVariant, this.sand, this.silt, this.clay);
        var darkeningColorMult = (this.waterContainment / this.waterContainmentMax);
        outColor.r *= (1 - 0.24 * darkeningColorMult);
        outColor.g *= (1 - 0.30 * darkeningColorMult);
        outColor.b *= (1 - 0.383 * darkeningColorMult);
        return outColor;
    }

    setVariant() {
        let arr = loadUI(UI_PALETTE_COMPOSITION);
        this.sand = arr[0];
        this.silt = arr[1];
        this.clay = arr[2];
        this.randomize();
    }

    initWaterContainment() {
        this.waterContainment = 0;
    }

    getLightFilterRate() {
        return super.getLightFilterRate() * loadUI(UI_LIGHTING_ROCK);
    }

    getWaterflowRate() {
        return super.getWaterflowRate() * 100;
    }

    doBlockOutflow() {
        super.doBlockOutflow();
        this.outflowNewWaterToLocation(this.posX, this.posY + 1);
    }
}