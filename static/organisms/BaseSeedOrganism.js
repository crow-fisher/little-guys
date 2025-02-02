import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism } from "./_orgOperations.js";
import { getCurDay } from "../time.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.type = "seed";
        this.sproutType = null;
        this.maxLifeTime = 1
    }

    growInitialSquares() {
        var newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
        if (addOrganismSquare(newLifeSquare)) {
            newLifeSquare.linkSquare(this.linkedSquare);
            this.linkedSquare.linkOrganismSquare(newLifeSquare);
            this.addAssociatedLifeSquare(newLifeSquare);
        }
    }

    getSproutType() {
        return null;
    }

    postTick() {
        var lifeCyclePercentage = (getCurDay() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1 || this.linkedSquare == -1 || this.linkedSquare == null) {
            this.destroy();
            return;
        }
        if (this.lifeSquares.some((lsq) => lsq.sproutStatus >= 1)) {
            var linkedSquareCache = this.linkedSquare;
            this.destroy();
            addNewOrganism(new (this.getSproutType())(linkedSquareCache));
        }
    }
}

export {BaseSeedOrganism} 