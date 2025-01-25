import {BaseOrganism} from "./BaseOrganism.js"
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { PopGrassOrganism } from "./PopGrassOrganism.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getSquares } from "../squares/_sqOperations.js";
import { addNewOrganism, addOrganism } from "./_orgOperations.js";
import { getCurDay, getCurTime } from "../time.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.type = "seed";
        this.sproutCtor = null;
        this.maxLifeTime = 1000 * 60 * 1;

    }
    growInitialSquares() {
        var newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
        if (addOrganismSquare(newLifeSquare)) {
            newLifeSquare.linkSquare(this.linkedSquare);
            this.linkedSquare.linkOrganismSquare(newLifeSquare);
            this.addAssociatedLifeSquare(newLifeSquare);
        }
    }

    postTick() {
        var lifeCyclePercentage = (getCurDay() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }
        if (this.lifeSquares.some((lsq) => lsq.sproutStatus >= 1)) {
            var linkedSquareCache = this.linkedSquare;
            this.destroy();
            addNewOrganism(this.sproutCtor(linkedSquareCache));
        }
    }
}

export {BaseSeedOrganism} 