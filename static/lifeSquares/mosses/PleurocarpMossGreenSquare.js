import { BaseLifeSquare, LSQ_RENDERMODE_CIRCLE } from "../BaseLifeSquare.js";
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_FLOWERBUD } from "../../organisms/Stages.js";
import { BaseMossGreenSquare } from "./BaseMossGreenSquare.js";

export class PleurocarpMossGreenSquare extends BaseMossGreenSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "PleurocarpMossGreenSquare";
        this.type = "green";
        this.width = 1;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
        this.lsqLightDecayValue = 0;
    }

    applySubtypeRenderConfig() {
        this.baseColor = "#515c24";
        this.darkColor = "#353b1a";
        this.accentColor = "#5d6637";
    }
}