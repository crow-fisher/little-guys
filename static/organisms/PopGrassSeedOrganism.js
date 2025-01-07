import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { PopGrassOrganism } from "./PopGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurTime } from "../time.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";

class PopGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "PopGrassSeedOrganism";
        this.sproutCtor = (linkedSquare) => new PopGrassOrganism(linkedSquare)
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

export {PopGrassSeedOrganism} 