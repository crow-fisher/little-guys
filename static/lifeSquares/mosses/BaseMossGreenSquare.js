import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { BaseLifeSquare } from "../BaseLifeSquare.js";

export class BaseMossGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        square.linkOrganismSquare(this);
        applyLightingFromSource(square, this);
    }

    mossSqTick() {
        return 1;
    }
}