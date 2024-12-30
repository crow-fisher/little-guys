import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";
import { HydrangeaOrganism } from "./HydrangeaOrganism.js";

class HydrangeaSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "HydrangeaSeedOrganism";
        this.sproutCtor = (linkedSquare) => new HydrangeaOrganism(linkedSquare)
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

export {HydrangeaSeedOrganism} 