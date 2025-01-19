import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { ElephantEarOrganism } from "./ElephantEarOrganism.js";

export class ElephantEarSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "ElephantEarSeedOrganism";
        this.sproutCtor = (linkedSquare) => new ElephantEarOrganism(linkedSquare)
    }
}