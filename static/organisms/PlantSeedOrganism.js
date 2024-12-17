import {BaseOrganism} from "./BaseOrganism.js"
import { PlantSeedLifeSquare } from "../lifeSquares/PlantSeedLifeSquare.js";
import { PlantOrganism } from "./PlantOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurTime } from "../globals.js";

class PlantSeedOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantSeedOrganism";
        this.growInitialSquares();
    }
    growInitialSquares() {
        getSquares(this.posX, this.posY).filter((sq) => sq.collision && sq.rootable).forEach((sq) => {
            var newLifeSquare = new PlantSeedLifeSquare(this.posX, this.posY);
            if (addOrganismSquare(newLifeSquare)) {
                this.addAssociatedSquare(newLifeSquare);
            }
        });
    }

    postTick() {
        var lifeCyclePercentage = (getCurTime() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }
        if (this.associatedSquares[0].sproutStatus >= 1) {
            // now we need to convert ourself into a 'plant organism'
            this.destroy();
            addNewOrganism(new PlantOrganism(this.posX, this.posY));
        }
    }
}

export {PlantSeedOrganism} 