import { BaseOrganism } from "./BaseOrganism.js";
import { SeedLifeSquare } from "../lifeSquares/SeedLifeSquare.js";
import { getCurDay, getDt, getTimeScale } from "../climate/time.js";
import { loadGD, UI_SIMULATION_GENS_PER_DAY } from "../ui/UIData.js";
import { getCurPlantConfiguratorVal } from "../ui/elements/SliderGradientBackgroundPlantConfigurator.js";
import { getSquares } from "../squares/_sqOperations.js";
import { randNumber } from "../common.js";

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
                this.applyEvolutionParameters(new (this.getSproutType())(linkedSquareCache));
            }
        }
        this.plantSeedPhysics();
    }

    plantSeedPhysics() {
        if (this.linkedSquare.proto != "SeedSquare")
            return;
        
        let sq = getSquares(Math.round(this.posX), Math.round(this.posY + randNumber(2, 5)))
            .find((sq) => (this.rockable ? (sq.proto == "SoilSquare" || sq.proto == "RockSquare") : sq.proto == "SoilSquare"));
        if (sq == null) {
            let rockSq = getSquares(this.posX, this.posY + randNumber(2, 5))
                .find((sq) => sq.proto == "RockSquare");
            if (rockSq != null) {
                this.destroy(true);
                return;
            }
            return;
        }

        if (sq.linkedOrganismSquares.some((lsq) => lsq.proto == this.getSproutTypeProto())) {
            console.log("Destroying; found an org here of the same proto")
            this.linkedSquare.destroy(true);
            return;
        }
        let origSq = this.linkedSquare;
        this.unlinkSquare(true);
        origSq.destroy(false);
        this.posX = sq.posX;
        this.posY = sq.posY;
        this.linkSquare(sq);
    }

    applyEvolutionParameters(org) {
        if (org == false || org == null || this.evolutionParameters == null) {
            return;
        }
        org.setEvolutionParameters(this.evolutionParameters);
    }
}

export {BaseSeedOrganism} 