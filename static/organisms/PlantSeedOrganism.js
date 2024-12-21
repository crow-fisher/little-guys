import {BaseOrganism} from "./BaseOrganism.js"
import { PlantSeedLifeSquare } from "../lifeSquares/PlantSeedLifeSquare.js";
import { PlantOrganism } from "./PlantOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurTime } from "../globals.js";

class PlantSeedOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "PlantSeedOrganism";
        this.type = "seed";
    }
    growInitialSquares() {
        getSquares(this.posX, this.posY)
            .filter((sq) => sq.collision && sq.rootable)
            .forEach((sq) => {
                var newLifeSquare = new PlantSeedLifeSquare(this.linkedSquare, this);
                if (addOrganismSquare(newLifeSquare)) {
                    newLifeSquare.linkSquare(sq);
                    sq.linkOrganismSquare(newLifeSquare);
                    this.addAssociatedLifeSquare(newLifeSquare);
                }
        });
    }

    postTick() {
        var lifeCyclePercentage = (getCurTime() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }
        if (this.lifeSquares[0].sproutStatus >= 1) {
            // now we need to convert ourself into a 'plant organism'
            var linkedSquareCache = this.linkedSquare;
            this.destroy();
            addNewOrganism(new PlantOrganism(linkedSquareCache));
        }
    }
}

export {PlantSeedOrganism} 