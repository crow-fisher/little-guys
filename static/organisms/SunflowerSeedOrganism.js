import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { SunflowerOrganism } from "./SunflowerOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";

class SunflowerSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "SunflowerSeedOrganism";
        this.sproutCtor = (linkedSquare) => new SunflowerOrganism(linkedSquare)
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

export {SunflowerSeedOrganism} 