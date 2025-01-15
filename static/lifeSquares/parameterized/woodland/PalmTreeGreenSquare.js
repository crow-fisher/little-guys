import { BaseLifeSquare } from "../../BaseLifeSquare.js";

export class PalmTreeGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "PalmTreeGreenSquare";
    }
}