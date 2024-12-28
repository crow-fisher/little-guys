import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";
import { MossOrganism } from "./MossOrganism.js";

class MossSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "MossSeedOrganism";
        this.sproutCtor = (linkedSquare) => new MossOrganism(linkedSquare)
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

export {MossSeedOrganism} 