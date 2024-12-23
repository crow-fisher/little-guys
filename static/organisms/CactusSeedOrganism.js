import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { PopGrassOrganism } from "./PopGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism } from "./_orgOperations.js";
import { getCurTime } from "../globals.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";
import { CactusOrganism } from "./CactusOrganism.js";

class CactusSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "CactusSeedOrganism";
        this.sproutCtor = (linkedSquare) => new CactusOrganism(linkedSquare)
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

export {CactusSeedOrganism} 