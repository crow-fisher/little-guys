import { BaseLifeSquare } from "../../../BaseLifeSquare.js";

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