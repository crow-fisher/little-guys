import { randNumber } from "../../common.js";
import { addOrganismSquare, getOrganismSquaresAtSquareWithEntityId } from "../../lifeSquares/_lsOperations.js";
import { addSquare, getDirectNeighbors } from "../../squares/_sqOperations.js";
import { SoilSquare } from "../../squares/parameterized/SoilSquare.js";
import { PlantSquare } from "../../squares/PlantSquare.js";
import { getCurDay, getPrevDay } from "../../time.js";
import { addNewOrganism } from "../_orgOperations.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, STATE_DEAD, STATE_HEALTHY, STATE_THIRSTY, SUBTYPE_DEAD, SUBTYPE_ROOTNODE, SUBTYPE_SPROUT, TYPE_HEART, TYPE_TRUNK } from "./Stages.js";


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

        // fill these out!
        this.greenType = null;
        this.rootType = null;


        this.curWilt = 0;
        this.waterPressure = -2;
        this.waterPressureTarget = -2;
        this.waterPressureWiltThresh = -3;
        this.waterPressureDieThresh = -5;
        this.waterPressureOverwaterThresh = -1;
        this.transpirationRate = 0.001;
        this.rootPower = 2;
    }

    process() {
        this.preTick();
        this.tick();
        this.postTick();
    }

    postTick() {
        this.growAndDecay();
        this.waterPressure += this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare") 
            .filter((lsq) => (this.rootPower + lsq.linkedSquare.getSoilWaterPressure()) > this.waterPressure)
            .map((lsq) => {
                if (this.waterPressure < this.waterPressureTarget) {
                    return lsq.linkedSquare.suckWater(this.transpirationRate);
                } else {
                    return lsq.linkedSquare.suckWater(this.transpirationRate / 10);
                }
            })
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        this.waterPressure -= (this.lifeSquares.length * this.transpirationRate) / 10;
        this.wilt();
    }

    wilt() {
        if (this.lifeSquares.length == 0) {
            return;
        }
        if (this.waterPressure < this.waterPressureWiltThresh) {
            this.curWilt += 0.01;
            var numLifeSquares = this.lifeSquares.length;
            var lifeSquareToThirstify = this.lifeSquares.at(randNumber(0, numLifeSquares - 1));
            if (lifeSquareToThirstify.state == STATE_HEALTHY) {
                lifeSquareToThirstify.state = STATE_THIRSTY;
            } else if (lifeSquareToThirstify == STATE_THIRSTY) {
                lifeSquareToThirstify.state = STATE_DEAD;
            }
        } else {
            this.curWilt -= 0.01;
            var numLifeSquares = this.lifeSquares.length;
            var lifeSquareToRevive = this.lifeSquares.at(randNumber(0, numLifeSquares - 1));
            if (lifeSquareToRevive.state != STATE_DEAD) {
                lifeSquareToRevive.state = STATE_HEALTHY;
            }
        }

        if (this.waterPressure > this.waterPressureOverwaterThresh) {
            var numLifeSquares = this.lifeSquares.length;
            var lifeSquareToKill = this.lifeSquares.at(randNumber(0, numLifeSquares - 1));
            lifeSquareToKill.state = STATE_DEAD;
        }

        this.curWilt = Math.max(0, this.curWilt);
        this.curWilt = Math.min(Math.PI / 2, this.curWilt);
    }

    growPlantSquarePos(parentSquare, posX, posY) {
        var newPlantSquare = new PlantSquare(posX, posY);
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
        var out = [];
        out.push(...component.children.filter((child) => child.type === componentType)); 
        component.children.forEach((child) => out.push(...this._getAllComponentsofType(componentType, child)));
        return out;
    }

    getOriginsForNewGrowth(subtype) {
        return this._getOriginForNewGrowth(subtype, this.originGrowth);
    }

    _getOriginForNewGrowth(subtype, component) {
        var out = new Array();
        out.push(...component.lifeSquares.filter((sq) => sq.subtype == subtype))
        component.children.forEach((child) => out.push(...this._getOriginForNewGrowth(subtype, child)));
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
        if (this.linkedSquare.currentPressureDirect > 0) {
            this.destroy();
            return;
        }
        var growthPlan = new GrowthPlan(this.posX, this.posY, true, STAGE_JUVENILE, Math.PI / 2, 0, 0, 0, 0, TYPE_HEART, 10 ** 8);
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            0,
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

    executeGrowthPlans() {
        if (!this.alive) {
            return;
        }
        // if (!this.shouldGrow) {
        //     return;
        // }
        var anyStepFound = false;
        var timeBudget = getCurDay() - getPrevDay();
        this.growthPlans.filter((gp) => !gp.completed).forEach((growthPlan) => {
            anyStepFound = true;
            growthPlan.steps.filter((step) => !step.completed).forEach((step) => {
                if (
                    (getCurDay() + timeBudget >= growthPlan.stepLastExecuted + step.timeCost) &&
                    (this.currentEnergy >= step.energyCost)
                ) {
                    step.doAction();
                    step.growthPlan.stepLastExecuted = getCurDay();
                    this.currentEnergy -= step.energyCost;
                    if (this.originGrowth != null) {
                        this.originGrowth.updateDeflectionState();
                        this.originGrowth.applyDeflectionState();
                    }
                };
            });
            if (growthPlan.areStepsCompleted()) {
                growthPlan.complete();
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
            this.growRoot((sq) => sq.getSoilWaterPressure());
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
