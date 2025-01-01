import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { WindGrassOrganism } from "./WindGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";

class WindGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "WindGrassSeedOrganism";
        this.sproutCtor = (linkedSquare) => new WindGrassOrganism(linkedSquare)
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

export {WindGrassSeedOrganism} 