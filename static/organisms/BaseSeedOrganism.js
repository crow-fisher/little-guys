import {BaseOrganism} from "./BaseOrganism.js"
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { PopGrassOrganism } from "./PopGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurTime } from "../time.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.type = "seed";
        this.sproutCtor = null;
        this.maxLifeTime = 1000 * 60 * 1;

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
            addNewOrganism(this.sproutCtor(linkedSquareCache));
        }
    }
}

export {BaseSeedOrganism} 