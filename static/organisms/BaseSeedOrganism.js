import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism } from "./_orgOperations.js";
import { getCurDay } from "../time.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.sproutType = null;
        this.maxLifeTime = 1;
        this.startSproutTime = null;
        this.totalSproutTime = 0.01; // edit this, in days
        this.growInitialSquares();
    }

    growInitialSquares() {
        var newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
        if (addOrganismSquare(newLifeSquare)) {
            newLifeSquare.linkSquare(this.linkedSquare);
            this.linkedSquare.linkOrganismSquare(newLifeSquare);
            this.addAssociatedLifeSquare(newLifeSquare);
        } else {
            this.destroy();
        }
    }

    getSproutType() {
        return null;
    }

    process() {
        if (this.linkedSquare == null) {
            this.destroy();
            return;
        }
        if (this.startSproutTime == null) {
            if (this.linkedSquare.getSoilWaterPressure() > -3.5) {
                this.startSproutTime = getCurDay();
                console.log("Seed start...")
            }
        } else {
            if (this.linkedSquare.getSoilWaterPressure() < -5.5) {
                console.warn("Seeds got too dry...");
                this.destroy();
            } else if (getCurDay() - this.startSproutTime > this.totalSproutTime) {
                let linkedSquareCache = this.linkedSquare;
                this.destroy();
                addNewOrganism(new (this.getSproutType())(linkedSquareCache));
            }
        }
    }


    postTick() {
        var lifeCyclePercentage = (getCurDay() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            return;
        }
        if (this.lifeSquares.some((lsq) => lsq.sproutStatus >= 1)) {
            if (this.linkedSquare == -1) {
                console.warn("BAD SEED STATE!");
                return;
            }
            var linkedSquareCache = this.linkedSquare;
            this.destroy();
            addNewOrganism(new (this.getSproutType())(linkedSquareCache));
        }
    }
}

export {BaseSeedOrganism} 