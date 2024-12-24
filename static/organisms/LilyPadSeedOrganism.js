import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";
import { LilyPadOrganism } from "./LilyPadOrganism.js";

class LilyPadSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "PopGrassSeedOrganism";
        this.sproutCtor = (linkedSquare) => new LilyPadOrganism(linkedSquare)
    }
    growInitialSquares() {
        var newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
        if (addOrganismSquare(newLifeSquare)) {
            newLifeSquare.linkSquare(this.linkedSquare);
            this.linkedSquare.linkOrganismSquare(newLifeSquare);
            this.addAssociatedLifeSquare(newLifeSquare);
        }
    }
}

export {LilyPadSeedOrganism} 