import { addOrganismSquare, getOrganismSquaresAtSquareWithEntityId } from "../../lifeSquares/_lsOperations.js";
import { addSquare, getDirectNeighbors } from "../../squares/_sqOperations.js";
import { PlantSquare } from "../../squares/PlantSquare.js";
import { getCurDay } from "../../time.js";
import { addNewOrganism } from "../_orgOperations.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_ROOTNODE, SUBTYPE_SPROUT, TYPE_HEART, TYPE_TRUNK } from "./Stages.js";


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

        this.maxSquaresOfTypePerDay = 100;
        this.throttleInterval = () => 1 / this.maxSquaresOfTypePerDay;

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

    getAllComponentsofType(componentType) {
        return this._getAllComponentsofType(componentType, this.originGrowth);
    }

    _getAllComponentsofType(componentType, component) {
        var out = new Array();
        out.push(...component.children.filter((child) => child.type == componentType))
        out.push(...component.children.map((child) => this._getAllComponentsofType(subtype, child)))
        return out;
    }

    getOriginsForNewGrowth(subtype) {
        return this._getOriginForNewGrowth(subtype, this.originGrowth);
    }

    _getOriginForNewGrowth(subtype, component) {
        var out = new Array();
        out.push(...component.lifeSquares.filter((sq) => sq.subtype == subtype))
        out.push(...component.children.map((child) => this._getOriginForNewGrowth(subtype, child)))
        return out;
    }

    growAndDecay() {
        if (this.stage == STAGE_SPROUT) {
            this.growthPlans.push(this.gp_sprout())
        }

        let minNutrient = this.getMinNutrient();
        let meanNutrient = this.getMeanNutrient();

        if (this.airNutrients == minNutrient) {
            this.shouldGrow = true;
        } else {
            this.shouldGrow = false;
        }

        if (this.dirtNutrients == minNutrient && this.waterNutrients < meanNutrient * 1.1) {
            this.growDirtRoot();
        }

        if (this.waterNutrients == minNutrient && this.dirtNutrients < meanNutrient * 1.1) {
            this.growWaterRoot();
        }
        
        this.executeGrowthPlans();
    }

    gp_sprout() {
        var growthPlan = new GrowthPlan(this.posX, this.posY, true, STAGE_JUVENILE, 0, 0, TYPE_HEART);
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
        // if (!this.shouldGrow) {
        //     return;
        // }
        var anyStepFound = false;
        this.growthPlans.filter((gp) => !gp.completed).forEach((growthPlan) => {
            anyStepFound = true;
            growthPlan.steps.filter((step) => !step.completed).forEach((step) => {
                if (
                    (getCurDay() >= step.timeGetter() + step.timeCost) &&
                    (this.currentEnergy >= step.energyCost)
                ) {
                    step.doAction();
                    step.timeSetter(getCurDay());
                    this.currentEnergy -= step.energyCost;
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

        if (!anyStepFound) {
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

    growRoot(f) {
        var targetSquare = null;
        var targetSquareParent = null;
        this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => {
            getDirectNeighbors(lsq.posX, lsq.posY)
                .filter((_sq) => _sq != null)
                .filter((_sq) => _sq.rootable)
                .filter((_sq) => getOrganismSquaresAtSquareWithEntityId(_sq, this.spawnedEntityId).length == 0)
                .filter((_sq) => targetSquare == null || f(targetSquare) < f(_sq))
                .forEach((_sq) => {targetSquare = _sq; targetSquareParent = lsq});
        });
        if (targetSquare == null) {
            return;
        }

        var newRootLifeSquare = addOrganismSquare(new this.rootType(targetSquare, this));
        if (newRootLifeSquare) {
            this.addAssociatedLifeSquare(newRootLifeSquare);
            newRootLifeSquare.linkSquare(targetSquare);
            targetSquareParent.addChild(newRootLifeSquare)
            targetSquare.linkOrganismSquare(newRootLifeSquare);
        }
    }

    growWaterRoot() {
        if (!this.canGrowRoot()) {
            return 0;
        }
        if (getCurDay() > this.waterLastGrown + this.throttleInterval()) {
            this.waterLastGrown = getCurDay();
            this.growRoot((sq) => sq.waterContainment);
        }
    }

    growDirtRoot() {
        if (!this.canGrowRoot()) {
            return 0;
        }
        if (getCurDay() > this.waterLastGrown + this.throttleInterval()) {
            this.rootLastGrown = getCurDay();
            this.growRoot((sq) => sq.nutrientValue.value);
        }
    }
}
