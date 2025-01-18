import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { PalmTreeOrganism } from "./PalmTree.js";

export class PalmTreeSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "PalmTreeSeedOrganism";
        this.sproutCtor = (linkedSquare) => new PalmTreeOrganism(linkedSquare)
    }
}