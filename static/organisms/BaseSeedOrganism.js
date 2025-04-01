import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { addNewOrganism } from "./_orgOperations.js";
import { getCurDay, getTimeScale } from "../climate/time.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square, evolutionParameters = null) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.sproutType = null;
        this.maxLifeTime = 10;
        this.startSproutTime = null;
        this.totalSproutTime = 3 * (getTimeScale() / 86400);
        this.evolutionParameters = evolutionParameters;
        this.growInitialSquares();
    }

    growInitialSquares() {
        let newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
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
            }
        } else {
            if (this.linkedSquare.getSoilWaterPressure() < -5.5) {
                this.destroy();
            } else if (getCurDay() - this.startSproutTime > this.totalSproutTime) {
                let linkedSquareCache = this.linkedSquare;
                this.destroy();
                this.applyEvolutionParameters(addNewOrganism(new (this.getSproutType())(linkedSquareCache)));
            }
        }
    }

    applyEvolutionParameters(org) {
        if (org == false || org == null || this.evolutionParameters == null) {
            return;
        }
        org.setEvolutionParameters(this.evolutionParameters);
    }


    postTick() {
        let lifeCyclePercentage = (getCurDay() - this.spawnTime) / this.maxLifeTime;
        if (lifeCyclePercentage > 1) {
            return;
        }
        if (this.lifeSquares.some((lsq) => lsq.sproutStatus >= 1)) {
            if (this.linkedSquare == -1) {
                console.warn("BAD SEED STATE!");
                return;
            }
            let linkedSquareCache = this.linkedSquare;
            this.destroy();
            this.applyEvolutionParameters(addNewOrganism(new (this.getSproutType())(linkedSquareCache)));
        }
    }
}

export {BaseSeedOrganism} 