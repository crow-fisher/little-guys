import { BaseLifeSquare, LSQ_RENDERMODE_CIRCLE, LSQ_RENDERMODE_THETA } from "../BaseLifeSquare.js";
import { SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE } from "../../organisms/Stages.js";
import { hueShiftColorArr, rgbToHex } from "../../common.js";
import { loadGD, UI_LIGHTING_PLANT_TREE } from "../../ui/UIData.js";

export class PalmTreeGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "PalmTreeGreenSquare";
        this.type = "green";
        this.width = 1;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
    }

    applySubtypeRenderConfig() {
        switch (this.subtype) {
            case SUBTYPE_FLOWERNODE:
            case SUBTYPE_FLOWER:
                this.baseColor = "#1f5436";
                this.darkColor = "#301a11";
                this.accentColor = "#3b231a";
                this.width = 1.4 + (0.1 * Math.random())
                this.renderMode = LSQ_RENDERMODE_CIRCLE;
                break;
            case SUBTYPE_TRUNK:
            case SUBTYPE_SHOOT:
            case SUBTYPE_SPROUT:
            case SUBTYPE_STEM:
                this.baseColor = "#91705c";
                this.darkColor = "#ad987b";
                this.accentColor = "#b0805d"; 
                this.renderMode = LSQ_RENDERMODE_THETA;
                break;
            case SUBTYPE_NODE:
            case SUBTYPE_LEAF:
                this.baseColor = "#7f760b";
                this.darkColor = "#302e03";
                this.accentColor = "#958c63";
                this.width = 1
                this.renderMode = LSQ_RENDERMODE_CIRCLE;
                break;
            default:
                console.warn("Subtype doesn't have a display configuration!")
        }
        if (this.subtype != SUBTYPE_STEM) {
            let hueShift = 10 * this.linkedOrganism.evolutionParameters[0];
            let saturationShift = this.linkedOrganism.getWilt();
            this.accentColor = rgbToHex(...hueShiftColorArr(this.accentColor, hueShift, saturationShift,0));
            this.darkColor = rgbToHex(...hueShiftColorArr(this.darkColor, hueShift, saturationShift, 0));
            this.baseColor = rgbToHex(...hueShiftColorArr(this.baseColor, hueShift, saturationShift, 0));
        }
    }

    getLightFilterRate() {
        return super.getLightFilterRate() * Math.exp(loadGD(UI_LIGHTING_PLANT_TREE));
    }
}