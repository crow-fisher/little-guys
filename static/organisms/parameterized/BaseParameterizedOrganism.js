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
        this.growthPlans = [];

        this.originGrowth = null;

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
            this.growthPlans.push(this.gp_sprout())
        }
        this.executeGrowthPlans();
    }

    gp_sprout() {
        var growthPlan = new GrowthPlan(this.posX, this.posY, true, STAGE_JUVENILE, 0, 1);
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
                    this.rootGreen = greenSquare;
                    return greenSquare  ;
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
                return rootSq;
            }
        ));
        growthPlan.postConstruct = () => this.originGrowth = growthPlan.getGrowthComponent();
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
        this.growthPlans.filter((gp) => !gp.completed).forEach((growthPlan) => {
            growthPlan.steps.forEach((step) => {
                if (
                    (getCurDay() >= step.timeGetter() + step.timeCost) &&
                    (this.currentEnergy >= step.energyCost)
                ) {
                    step.doAction();
                    step.timeSetter(getCurDay());
                    this.currentEnergy -= step.energyCost;
                };
            });
            if (growthPlan.areStepsCompleted()) {
                growthPlan.postConstruct();
                growthPlan.completed = true;
            }
            if (growthPlan.required && growthPlan.steps.some((step) => step.completedSquare == null)) {
                this.destroy();
            }
        });
    }

    _updateDeflectionState(growthComponent) {
        var strength = growthComponent.getTotalStrength();
        var length = growthComponent.getTotalSize();
        var windVec = growthComponent.getNetWindSpeed();

        var startSpringForce = growthComponent.getStartSpringForce();

        var windX = windVec[0];
        windX *= (strength / length);
        var coef = 0.5;
        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        growthComponent.setCurrentDeflection(Math.asin(endSpringForce / growthComponent.springCoef));
        growthComponent.children.forEach(this._updateDeflectionState);
    }

    updateDeflectionState() {
        if (this.originGrowth != null) {
            this._updateDeflectionState(this.originGrowth);
        }
    }

    _applyDeflectionStateToSquares(growthComponent, parentComponent) {
        var startDeflectionXOffset = 0;
        var startDeflectionYOffset = 0;
        if (parentComponent != null) {
            startDeflectionXOffset = parentComponent.getDeflectionXAtPosition(growthComponent.posX, growthComponent.posY);
            startDeflectionYOffset = parentComponent.getDeflectionYAtPosition(growthComponent.posX, growthComponent.posY);
        }

        var startTheta = growthComponent.deflectionRollingAverage;
        var endTheta = growthComponent.currentDeflection;
        var length = growthComponent.getTotalSize();

        var thetaDelta = endTheta - startTheta;

        growthComponent.lifeSquares.forEach((lsq) => {
            // relative to origin
            var relLsqX = growthComponent.posX - lsq.posX;
            var relLsqY = growthComponent.posY - lsq.posY;
            var lsqDist = (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
            var currentTheta = startTheta + (lsqDist / length) * thetaDelta;

            var endX = startDeflectionXOffset + relLsqX * Math.cos(currentTheta) - relLsqY * Math.sin(currentTheta);
            var endY = startDeflectionYOffset + relLsqY * Math.cos(currentTheta) + relLsqX * Math.sin(currentTheta);

            lsq.deflectionXOffset = endX - relLsqX;
            lsq.deflectionYOffset = endY - relLsqY;
        })

        growthComponent.children.forEach(this._applyDeflectionStateToSquares);
    }


    applyDeflectionStateToSquares() {
        if (this.originGrowth != null) {
            this._applyDeflectionStateToSquares(this.originGrowth, null);
        }

    }


}
