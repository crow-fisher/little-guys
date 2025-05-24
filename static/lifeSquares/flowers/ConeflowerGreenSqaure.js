import { BaseLifeSquare, LSQ_RENDERMODE_CIRCLE } from "../BaseLifeSquare.js";
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_FLOWERBUD } from "../../organisms/Stages.js";

export class ConeflowerGreenSqaure extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "ConeflowerGreenSqaure";
        this.type = "green";
        this.width = 1;
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
                case SUBTYPE_FLOWERBUD:
                    this.baseColor = "#515c24";
                    this.darkColor = "#353b1a";
                    this.accentColor = "#5d6637";
                    this.width = 0.7;
                    this.renderMode = LSQ_RENDERMODE_CIRCLE;
                    break;
                case SUBTYPE_FLOWERNODE:
                    this.baseColor = "#382b23";
                    this.darkColor = "#382b23";
                    this.accentColor = "#382b23";
                    this.width = 1;
                    this.renderMode = LSQ_RENDERMODE_CIRCLE;
                    break;
                case SUBTYPE_FLOWER:
                case SUBTYPE_FLOWERTIP:
                    this.baseColor = "#735385";
                    this.darkColor = "#7a4a74";
                    this.accentColor = "#525a2f";
                    this.width = 0.73;
                    break;
                case SUBTYPE_TRUNK:
                case SUBTYPE_SHOOT:
                case SUBTYPE_SPROUT:
                case SUBTYPE_NODE:
                case SUBTYPE_LEAF:
                case SUBTYPE_STEM:
                    this.baseColor = "#515c24";
                    this.darkColor = "#353b1a";
                    this.accentColor = "#5d6637";
                    break;
                default:
                    console.warn("Subtype doesn't have a display configuration!")
            }
        }
    }
}