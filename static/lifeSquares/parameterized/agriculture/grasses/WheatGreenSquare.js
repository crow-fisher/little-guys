getNeighbors
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_DEAD, SUBTYPE_LEAF, SUBTYPE_LEAFSTEM, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK } from "../../../../organisms/Stages.js";

import { hexToRgb } from "../../../../common.js";
import { getNeighbors } from "../../../../squares/_sqOperations.js";
import { BaseLifeSquare } from "../../../BaseLifeSquare.js";
import { airNutrientsPerEmptyNeighbor } from "../../../../config/config.js";

export class WheatGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "WheatGreenSquare";
        this.type = "green";
        this.width = 1;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
    }
}