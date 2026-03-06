import { hexToRgb } from "../common.js";
import { BaseLifeSquare } from "./BaseLifeSquare.js";

export class RootLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(organism);
        this.linkSquare(square);
        square.linkOrganismSquare(this);
        this.proto = "RootLifeSquare";
        this.opacity = 0; // TODO: Set this to be a UI param so it's adjustabale-live
    }
}