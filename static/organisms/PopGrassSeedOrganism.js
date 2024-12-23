import { PlantSeedLifeSquare } from "../lifeSquares/PlantSeedLifeSquare.js";
import { PopGrassOrganism } from "./PopGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurTime } from "../globals.js";
import { BaseSeedOrganism } from "./BaseSeedOrganism.js";

class PopGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "PopGrassSeedOrganism";
        this.sproutCtor = (linkedSquare) => new PopGrassOrganism(linkedSquare)
    }
    growInitialSquares() {
        var newLifeSquare = new PlantSeedLifeSquare(this.linkedSquare, this);
        if (addOrganismSquare(newLifeSquare)) {
            newLifeSquare.linkSquare(this.linkedSquare);
            this.linkedSquare.linkOrganismSquare(newLifeSquare);
            this.addAssociatedLifeSquare(newLifeSquare);
        }
    }

    postTick() {
        if (!(getSquares(this.linkedSquare.posX, this.linkedSquare.posY).some((sq) => sq == this.linkedSquare))) {
            this.destroy();
        }

        var lifeCyclePercentage = (getCurTime() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }
        if (this.lifeSquares.some((lsq) => lsq.sproutStatus >= 1)) {
            // now we need to convert ourself into a 'plant organism'
            var linkedSquareCache = this.linkedSquare;
            this.destroy();
            addNewOrganism(new PopGrassOrganism(linkedSquareCache));
        }
    }
}

export {PopGrassSeedOrganism} 