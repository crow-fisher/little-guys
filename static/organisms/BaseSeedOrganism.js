import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { getCurDay, getDt, getTimeScale } from "../climate/time.js";
import { loadGD, UI_SIMULATION_GENS_PER_DAY } from "../ui/UIData.js";
import { getCurPlantConfiguratorVal } from "../ui/elements/SliderGradientBackgroundPlantConfigurator.js";
import { getSquares } from "../squares/_sqOperations.js";
import { randNumber } from "../common.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";

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
        if (this.linkedSquare != null && this.linkedSquare.getMovementSpeed() > 0)
            return;
        
        if (this.age > loadGD(UI_SIMULATION_GENS_PER_DAY) * 2) {
            this.destroySeed();
            return;
        }

        if (this.sproutAge != null) {
            this.sproutAge += getDt();
            if (this.sproutAge > this.totalSproutTime) {
                let linkedSquareCache = this.linkedSquare;
                this.applyEvolutionParameters(new (this.getSproutType())(linkedSquareCache));
                this.destroy();
                return;
            }
        }
        this.plantSeedPhysics();
    }
    
    destroySeed() { 
        this.linkedSquare.destroy(true);
    }

    plantSeedPhysics() {
        if (this.linkedSquare.proto != "SeedSquare")
            return;

        if (!this.rockable && getSquares(this.posX, this.posY + 1).some((sq) => sq.proto != "SoilSquare" && sq.proto != "WaterSquare")) {
            this.destroySeed();
            return;
        }

        let searchDist = randNumber(2, 5);

        let soilSq = getSquares(this.posX, this.posY + searchDist)
            .find((sq) => sq.proto == "SoilSquare");
        let rockSq = getSquares(this.posX, this.posY + searchDist)
            .find((sq) => sq.proto == "RockSquare");
        
        let targetSq = (this.rockable ? (soilSq ?? rockSq) : soilSq);

        if (targetSq != null) {
            if (targetSq.linkedOrganismSquares.some((lsq) => lsq.linkedOrganism.proto == this.getSproutTypeProto())) {
                this.destroySeed();
                return;
            } // only happy path out of this statement
        } else {
            if (rockSq != null && !this.rockable) {
                this.destroySeed(true);
            }
            return;
        }

        // now plant yourself in soilSq

        let origSeedSquare = this.linkedSquare;
        this.unlinkSquare(true);
        origSeedSquare.destroy(false);

        this.posX = targetSq.posX;
        this.posY = targetSq.posY;

        this.greenLifeSquares.forEach((lsq) => {
            lsq.posX = this.posX;
            lsq.posY = this.posY;
            lsq.linkSquare(soilSq);
            targetSq.linkOrganismSquare(lsq);
        });
        
        this.linkSquare(targetSq);

        this.sproutAge = 0;
    }

    applyEvolutionParameters(org) {
        if (org == false || org == null || this.evolutionParameters == null) {
            return;
        }
        org.setEvolutionParameters(this.evolutionParameters);
    }
}

export {BaseSeedOrganism} 