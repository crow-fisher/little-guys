import { BaseLifeSquare } from "../../BaseLifeSquare.js";

export class LilyOfTheValleyGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "LilyOfTheValleyGreenSquare";
    }
}