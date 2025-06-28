import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { addNewOrganism } from "./_orgOperations.js";
import { getCurDay, getDt, getTimeScale } from "../climate/time.js";
import { loadGD, UI_SIMULATION_GENS_PER_DAY } from "../ui/UIData.js";
import { getCurPlantConfiguratorVal } from "../ui/elements/SliderGradientBackgroundPlantConfigurator.js";

class BaseSeedOrganism extends BaseOrganism {
    constructor(square, evolutionParameters = null) {
        super(square);
        this.proto = "BaseSeedOrganism";
        this.sproutType = null;
        this.maxLifeTime = 10;
        this.sproutAge = null;
        this.totalSproutTime = 3 * (getTimeScale() / 86400);
        this.evolutionParameters = (evolutionParameters ?? [Math.max(0, Math.min(1, (Math.random() - .5) * 0.25 + getCurPlantConfiguratorVal()))]);
        this.growInitialSquares();
    }

    growInitialSquares() {
        let newLifeSquare = new SeedLifeSquare(this.linkedSquare, this);
        newLifeSquare.linkSquare(this.linkedSquare);
        this.linkedSquare.linkOrganismSquare(newLifeSquare);
        this.addAssociatedLifeSquare(newLifeSquare);
    }

    getSproutType() {
        return null;
    }
    getSproutTypeProto() {
        return "BaseOrganism";
    }

    process() {
        if (this.age > loadGD(UI_SIMULATION_GENS_PER_DAY) * 2) {
            this.destroy();
            return;
        }
        if (this.linkedSquare == null) {
            this.destroy();
            return;
        }
        if (this.sproutAge == null) {
            if (this.linkedSquare.getSoilWaterPressure() > -10) {
                this.sproutAge = 0;
            }
        } else {
            this.sproutAge += getDt();
            if (this.sproutAge > this.totalSproutTime) {
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
}

export {BaseSeedOrganism} 