import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWERNODE } from "../../organisms/Stages.js";
import { hueShiftColorArr, rgbToHex } from "../../common.js";
import { loadGD, UI_LIGHTING_PLANT_GRASS } from "../../ui/UIData.js";
import { BaseLifeSquare } from "../BaseLifeSquare.js";

export class KentuckyBluegrassGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "KentuckyBluegrassGreenSquare";
        this.type = "green";
        this.width = 0.7;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
    }

    applySubtypeRenderConfig() {
        if (this.state == STATE_DEAD) {
            this.baseColor = "#70747e";
            this.darkColor = "#a1816d";
            this.accentColor = "#33261d";
        } else if (this.state == STATE_THIRSTY) {
            this.baseColor = "#6a7831";
            this.darkColor = "#4a5226";
            this.accentColor = "#67703f";
        } else {
            switch (this.subtype) {
                case SUBTYPE_FLOWERNODE:
                case SUBTYPE_TRUNK:
                case SUBTYPE_SHOOT:
                case SUBTYPE_SPROUT:
                case SUBTYPE_STEM:
                case SUBTYPE_NODE:
                case SUBTYPE_LEAF:
                    this.baseColor = "#2e301d";
                    this.darkColor = "#222415";
                    this.accentColor = "#30331d";
                    break;
                default:
                    console.warn("Subtype doesn't have a display configuration!")
            }
        }

        if (this.subtype == SUBTYPE_STEM) {
            let hueShift = 20 * (this.linkedOrganism.evolutionParameters[0] - 0.5);
            let saturationShift = 0.2 * (this.linkedOrganism.evolutionParameters[0] - 0.5);
            let valueShift = 0.2 * (this.linkedOrganism.evolutionParameters[0] - 0.5);
            this.accentColor = rgbToHex(...hueShiftColorArr(this.accentColor, hueShift, saturationShift, valueShift));
            this.darkColor = rgbToHex(...hueShiftColorArr(this.darkColor, hueShift, saturationShift, valueShift));
            this.baseColor = rgbToHex(...hueShiftColorArr(this.baseColor, hueShift, saturationShift, valueShift));
        }
    }

    getLightFilterRate() {
        return super.getLightFilterRate() * Math.exp(loadGD(UI_LIGHTING_PLANT_GRASS))
    }
}