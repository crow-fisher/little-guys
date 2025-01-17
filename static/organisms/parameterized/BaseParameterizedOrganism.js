import { addOrganismSquare } from "../../lifeSquares/_lsOperations.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { PlantSquare } from "../../squares/PlantSquare.js";
import { getCurDay } from "../../time.js";
import { addNewOrganism } from "../_orgOperations.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_ROOTNODE, SUBTYPE_SPROUT } from "./Stages.js";


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
        this.growthPlans = [];
        
        this.shouldGrow = true;

        this.originGrowth = null;

        // organism config in 'days'
        this.adultTime = 3;

        // store the actual time we attained them at
        this.stageTimeMap = { STAGE_SPROUT: 0 };
        this.stageGrowthPlans = {}

        // fill these out!
        this.greenType = null;
        this.rootType = null;
    }

    growPlantSquare(parentSquare, dx, dy) {
        var newPlantSquare = new PlantSquare(parentSquare.posX + dx, parentSquare.posY - dy);
        if (addSquare(newPlantSquare)) {
            var newGreenSquare = addOrganismSquare(new this.greenType(newPlantSquare, this));
            if (newGreenSquare) {
                this.addAssociatedLifeSquare(newGreenSquare);
                newGreenSquare.linkSquare(newPlantSquare);
                parentSquare.addChild(newPlantSquare);
                return newGreenSquare;
            }
        }
        return null;
    }

    getOriginsForNewGrowth(subtype) {
        return this._getOriginForNewGrowth(subtype, this.originGrowth);
    }

    _getOriginForNewGrowth(subtype, component) {
        var out = new Array();
        out.push(...component.lifeSquares.filter((sq) => sq.subtype == subtype))
        component.children.map((child) => this._getOriginForNewGrowth(subtype, child)).forEach((o) => out.push(...o));
        return out;
    }

    growAndDecay() {
        if (this.stage == STAGE_SPROUT) {
            this.growthPlans.push(this.gp_sprout())
        }
        this.executeGrowthPlans();
    }

    gp_sprout() {
        var growthPlan = new GrowthPlan(this.posX, this.posY, true, STAGE_JUVENILE, 0, 0, 1);
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            0,
            () => this.rootLastGrown,
            (time) => this.rootLastGrown = time,
            () => {
                var rootSq = new this.rootType(this.linkedSquare, this);
                rootSq.linkSquare(this.linkedSquare);
                rootSq.subtype = SUBTYPE_ROOTNODE;
                this.linkedSquare.linkOrganismSquare(rootSq);
                this.addAssociatedLifeSquare(rootSq);
                return rootSq;
            }
        ));
        growthPlan.postConstruct = () => this.originGrowth = growthPlan.component;
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
        if (!this.shouldGrow) {
            return;
        }
        var somethingDone = false;
        this.growthPlans.filter((gp) => !gp.completed).forEach((growthPlan) => {
            growthPlan.steps.filter((step) => !step.completed).forEach((step) => {
                if (
                    (getCurDay() >= step.timeGetter() + step.timeCost) &&
                    (this.currentEnergy >= step.energyCost)
                ) {
                    step.doAction();
                    step.timeSetter(getCurDay());
                    this.currentEnergy -= step.energyCost;
                    somethingDone = true;

                    if (this.originGrowth != null) {
                        this.originGrowth.updateDeflectionState();
                        this.originGrowth.applyDeflectionState();
                    }
                };
            });
            if (growthPlan.areStepsCompleted()) {
                growthPlan.completed = true;
                this.stage = growthPlan.endStage;
            }
            if (growthPlan.required && growthPlan.steps.some((step) => step.completedSquare == null)) {
                this.destroy();
            }
        });

        if (!somethingDone) {
            this.planGrowth();
        }
    }

    planGrowth() {}

    updateDeflectionState() {
        if (this.originGrowth != null) {
            this.originGrowth.updateDeflectionState();
        }
    }

    applyDeflectionStateToSquares() {
        if (this.originGrowth != null) {
            this.originGrowth.applyDeflectionState(null);
        }
    }

}
