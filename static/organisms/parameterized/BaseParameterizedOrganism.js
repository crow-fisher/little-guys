import { addSquare } from "../../squares/_sqOperations.js";
import { PlantSquare } from "../../squares/PlantSquare.js";
import { getCurDay } from "../../time.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT } from "./Stages.js";


export class BaseParameterizedOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.stage = STAGE_SPROUT;
        this.stages = [
            STAGE_SPROUT,
            STAGE_JUVENILE,
            STAGE_ADULT,
            STAGE_FLOWER,
            STAGE_FRUIT
        ];
        this.activeGrowthPlans = [];

        // organism config in 'days'
        this.adultTime = 3;

        // store the actual time we attained them at
        this.stageTimeMap = { STAGE_SPROUT: 0 };

        // fill these out!
        this.greenType = null;
        this.rootType = null;

    }

    growAndDecay() {
        if (this.stage == STAGE_SPROUT) {
            this.activeGrowthPlans.push(this.gp_sprout())
        }
        this.executeGrowthPlans();
    }

    gp_sprout() {
        var growthPlan = new GrowthPlan(true, STAGE_JUVENILE);
        growthPlan.steps.push(new GrowthPlanStep(
            0,
            0,
            () => this.plantLastGrown,
            (time) => this.plantLastGrown = time,
            () => {
                var plantSquare = new PlantSquare(this.posX, this.posY - 1);
                if (addSquare(plantSquare)) {
                    var greenSquare = new this.greenType(plantSquare, this);
                    greenSquare.linkSquare(plantSquare);
                    plantSquare.linkOrganismSquare(greenSquare);
                    this.addAssociatedLifeSquare(greenSquare);
                    return true;
                }
                return false;
            }
        ));

        growthPlan.steps.push(new GrowthPlanStep(
            0,
            0,
            () => this.rootLastGrown,
            (time) => this.rootLastGrown = time,
            () => {
                var rootSq = new this.rootType(this.linkedSquare, this);
                rootSq.linkSquare(this.linkedSquare);
                this.linkedSquare.linkOrganismSquare(rootSq);
                this.addAssociatedLifeSquare(rootSq);
                return true;
            }
        ));
        return growthPlan;
    }

    postTick() {
        this.lifeSquares.forEach((lifeSquare) => {
            this.dirtNutrients += lifeSquare.dirtNutrients * this.dirtCoef;
            this.waterNutrients += lifeSquare.waterNutrients * this.waterCoef;
            this.airNutrients += lifeSquare.airNutrients * this.airCoef;
        });

        var energyGained = this.law.photosynthesis(this.airNutrients - this.totalEnergy, this.waterNutrients - this.totalEnergy, this.dirtNutrients - this.totalEnergy);
        energyGained *= this.getHealthEnergyConversionEfficiency();

        this.currentEnergy += energyGained;
        this.totalEnergy += energyGained;

        var lifeCyclePercentage = this.getLifeCyclePercentage();
        if (lifeCyclePercentage > 1) {
            this.destroy();
        }
        this.growAndDecay();
    }

    executeGrowthPlans() {
        this.activeGrowthPlans.forEach((growthPlan) => {
            growthPlan.steps.forEach((step) => {
                if (
                    (getCurDay() >= step.timeGetter() + step.timeCost) &&
                    (this.currentEnergy >= step.energyCost)
                ) {
                    step.completed = step.action();
                    step.timeSetter(getCurDay());
                    this.currentEnergy -= step.energyCost;
                };
            });
            if (growthPlan.completed()) {
                this.stage = growthPlan.endStage;
                this.activeGrowthPlans = Array.from(this.activeGrowthPlans.filter((plan) => plan != growthPlan));
            }
        });
        if (this.activeGrowthPlans.some((plan) => plan.required && plan.steps.some((step) => !step.completed))) {
            this.destroy();
        }
    }
}
