import { BaseLifeSquare } from "../../BaseLifeSquare.js";

export class PalmTreeRootSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "PalmTreeRootSquare";
    }
}