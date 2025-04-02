import { BaseLifeSquare } from "../../../BaseLifeSquare.js";
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE } from "../../../../organisms/Stages.js";
import { addNewOrganism } from "../../../../organisms/_orgOperations.js";
import { WheatSeedOrganism } from "../../../../organisms/agriculture/WheatOrganism.js";
import { addSquare } from "../../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../../squares/SeedSquare.js";
import { hueShiftColorArr, rgbToHex } from "../../../../common.js";
import { loadGD, UI_LIGHTING_PLANT_GRASS } from "../../../../ui/UIData.js";

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
                    this.baseColor = "#5f633b";
                    this.darkColor = "#4e5234";
                    this.accentColor = "#6b704f";
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
        return super.getLightFilterRate() * loadGD(UI_LIGHTING_PLANT_GRASS)
    }

    doGroundDecay() {
        super.doGroundDecay();
        if (this.subtype == SUBTYPE_FLOWER || this.subtype == SUBTYPE_FLOWERNODE) {
            let groundSquare = this.groundTouchSquare();
            let offsetY = 1;
            if (groundSquare.currentPressureDirect > 0) {
                offsetY += (groundSquare.currentPressureDirect + 1);
            }
            let sq = addSquare(new SeedSquare(groundSquare.posX, groundSquare.posY - offsetY));
            if (sq) {
                sq.opacity = 0;
                let orgAdded = addNewOrganism(new WheatSeedOrganism(sq));
                if (!orgAdded) {
                    sq.destroy();
                }
            }
        }

    }
}