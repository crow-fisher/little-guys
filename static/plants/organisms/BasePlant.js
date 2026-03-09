import { getCurDay, getDt } from "../../climate/time.js";
import { STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_HEART, SUBTYPE_ROOTNODE, TYPE_HEART } from "./Stages.js";
import { getNeighbors } from "../../squares/_sqOperations.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { loadGD, UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA, UI_SIMULATION_GENS_PER_DAY, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT } from "../../ui/UIData.js";
import { MAIN_CONTEXT } from "../../index.js";
import { zoomCanvasFillRect } from "../../canvas.js";
import { GrowthPlan } from "./growthPlan/GrowthPlan.js";
import { GrowthPlanStep } from "./growthPlan/GrowthPlanStep.js";
import { PlantLifeSquare } from "../lifeSquares/PlantLifeSquare.js";
import { RootLifeSquare } from "../lifeSquares/RootLifeSquare.js";


export const _llt_target = "_llt_target";
export const _llt_min = "_llt_min";
export const _llt_max = "_llt_max";
export const _llt_throttlValMin = "_llt_throttlValMin";
export const _llt_throttlValMax = "_llt_throttlValMax";
export const _waterPressureSoilTarget = "_waterPressureSoilTarget";
export const _seedReduction = "_seedReduction";
export const _lightDecayValue = "_lightDecayValue";
export const _waterPressureOverwaterThresh = "_waterPressureOverwaterThresh";
export const _waterPressureWiltThresh = "_waterPressureWiltThresh";
export const _lightLevelDisplayExposureAdjustment = "_lightLevelDisplayExposureAdjustment";

export let baseOrganism_dnm = {
    _llt_target: 1,
    _llt_min: 0.5,
    _llt_max: 2,
    _llt_throttlValMin: 1,
    _llt_throttlValMax: 4,
    _waterPressureSoilTarget: -4,
    _seedReduction: 0.5,
    _lightDecayValue: 1,
    _waterPressureOverwaterThresh: 1,
    _waterPressureWiltThresh: -1,
    _lightLevelDisplayExposureAdjustment: -.16
}

class BasePlant {
    constructor(square, seedLifeSquare, evolutionParameters) {
        this.proto = "BasePlant";
        this.linkedSquare = square;
        this.stage = STAGE_SPROUT;
        this.spawnTime = getCurDay();
        // Required color parameters for rendering. 
        // As RGB arrays.
        this.seedLifeSquare = seedLifeSquare;
        this.evolutionParameters = evolutionParameters;

        this.evolutionMinColor = [63, 64, 79];
        this.evolutionMaxColor = [99, 0, 43];
        this.moistureMinColor = [255, 0, 0];
        this.moistureMaxColor = [0, 0, 255];

        this.originGrowth = null;
        this.greenLifeSquares = new Array();
        this.rootLifeSquares = new Array();
        this.growthPlans = [];
        this.age = 0;
        this.rootLastGrown = 0;
        this.greenLastGrown = 0;

        this.waterPressure = this.waterPressureSoilTarget();
        this.waterPressureChangeRate = .01;

        this.lightlevel = 0;
        this.growthCycleMaturityLength = 1;
        this.growthCycleLength = 1.5;
        this.numGrowthCycles = 1;

        this.growthNumGreen = 20;
        this.growthNumRoots = 30;
        this.curNumRoots = 0;
        this.curNumGreen = 0;

        this.deathProgress = 0;
    }

    getDefaultNutritionMap() {
        return baseOrganism_dnm;
    }

    getGenericNutritionParam(name) {
        let defaultMap = this.getDefaultNutritionMap();
        let configMap = loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[this.uiRef];
        if (configMap == null || configMap[name] == null) {
            return defaultMap[name];
        }
        return configMap[name];
    }

    llt_target() {
        return this.getGenericNutritionParam(_llt_target);
    }
    llt_min() {
        return this.getGenericNutritionParam(_llt_min);
    }
    llt_max() {
        return this.getGenericNutritionParam(_llt_max);
    }
    llt_throttlValMin() {
        return this.getGenericNutritionParam(_llt_throttlValMin);
    }
    llt_throttlValMax() {
        return this.getGenericNutritionParam(_llt_throttlValMax);
    }
    waterPressureSoilTarget() {
        return this.getGenericNutritionParam(_waterPressureSoilTarget);
    }
    seedReduction() {
        return this.getGenericNutritionParam(_seedReduction);
    }
    lightDecayValue() {
        return this.getGenericNutritionParam(_lightDecayValue);
    }
    waterPressureOverwaterThresh() {
        return this.getGenericNutritionParam(_waterPressureOverwaterThresh);
    }
    waterPressureWiltThresh() {
        return this.getGenericNutritionParam(_waterPressureWiltThresh);
    }
    lightLevelDisplayExposureAdjustment() {
        return this.getGenericNutritionParam(_lightLevelDisplayExposureAdjustment);
    }


    getGrowthCycleLength() {
        return (this.growthCycleLength / loadGD(UI_SIMULATION_GENS_PER_DAY));
    }
    getGrowthCycleMaturityLength() {
        return (this.growthCycleMaturityLength / loadGD(UI_SIMULATION_GENS_PER_DAY));
    }

    setEvolutionParameters(evolutionParameters) {
        this.evolutionParameters = evolutionParameters;
        this.processGenetics();
    }


    // IMPORTANT IMPLEMENTATION METHODS 
    getNextGenetics() {
        return structuredClone(this.evolutionParameters);
    }

    processGenetics() { } // fill this out in your implementation class!

    // ^^^^^^^^^^^^^^^^^^^

    updateRenderingState() {
        if (this.originGrowth != null) {
            this.originGrowth.updateDeflectionState(this.linkedSquare.cartesian_tl);
        }
    }

    // WATER SATURATION AND NUTRIENTS 

    waterPressureTick() {

        let target = this.waterPressureSoilTarget();
        let min = target + this.waterPressureWiltThresh();
        let max = target + this.waterPressureOverwaterThresh();

        let waterPressureLossRate;

        if (this.waterPressure < min)
            waterPressureLossRate = 0;
        else if (this.waterPressure < target)
            waterPressureLossRate = (this.waterPressure - min) / (target - min);
        else if (this.waterPressure < max)
            waterPressureLossRate = 1 + (this.waterPressure - target) / (max - target);
        else
            waterPressureLossRate = 2;

        this.waterPressure -= waterPressureLossRate * this.waterPressureChangeRate;

        let numRoots = this.rootLifeSquares.length;
        if (numRoots > 0)
            this.waterPressure += (1 / numRoots) * this.waterPressureChangeRate * this.rootLifeSquares.map((lsq) => {
                let sq = lsq.linkedSquare;
                let sqWaterPressure = sq.getSoilWaterPressure();
                let diffToTarget = sqWaterPressure - this.waterPressureSoilTarget();
                if (diffToTarget <= 0) {
                    return 0;
                }
                let amount = diffToTarget;
                if (this.waterPressure > target)
                    amount /= waterPressureLossRate;
                return amount;
            }).reduce((a, b) => a + b, 0);
    }

    nutrientTick() {
        // in the future, implement nitrogen, phosphorus, ph, micronutrients, etc here 
        this.greenLifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => [lsq.processLighting(), lsq.lightHealth ** 4])
            .map((argb) => argb[1] * (argb[0].r + argb[0].b) / (255 * 2))
            .forEach((lightlevel) => this.lsqLightLevel(this.llt_target() * lightlevel));
    }

    lsqLightLevel(val) {
        let c = this.curNumGreen;
        this.lightlevel = this.lightlevel * (c - 1) / c + (val / c);
    }

    wiltEfficiency() {
        return (1 - Math.abs(this.getWilt()));
    }

    growPlantSquare() {
        let newSquare = new PlantLifeSquare(this);
        this.greenLifeSquares.push(newSquare);
        return newSquare;
    }

    getWilt() {
        if (this.greenLifeSquares.length == 0) {
            return 0;
        }
        let greenLifeSquares = Array.from(this.greenLifeSquares.filter((lsq) => lsq.type == "green"));
        if (greenLifeSquares.length == 0) {
            return 0;
        }

        let target = this.waterPressureSoilTarget();
        let min = target + this.waterPressureWiltThresh();
        let max = target + this.waterPressureOverwaterThresh();

        if (this.waterPressure > target) {
            let mid = (target + max) / 2;
            if (this.waterPressure < mid) {
                return 0;
            }
            return Math.min(1, (this.waterPressure - mid) / (max - mid));
        } else if (this.waterPressure > min) {
            return ((this.waterPressure - min) / (target - min)) - 1;
        } else {
            return -1;
        }
    }

    // PHYSICAL SQUARES
    linkSquare(square) {
        square.linkOrganism(this);
        this.linkedSquare = square;
    }
    unlinkSquare(deep = true) {
        if (deep && this.linkedSquare != null) {
            this.linkedSquare.unlinkOrganism(this);
        }
        this.linkedSquare = null;
    }
    // LIFE SQUARES
    addGreenLifeSquare(lifeSquare) {
        this.greenLifeSquares.push(lifeSquare);
        let pred = (lsq) => lsq.lighting != null && lsq.lighting.length > 0;
        if (this.greenLifeSquares.some(pred)) {
            lifeSquare.lighting = this.greenLifeSquares.reverse().find(pred).lighting;
        }

    }
    // COMPONENT GROWTH

    getAllComponentsofType(componentType) {
        return this._getAllComponentsofType(componentType, this.originGrowth);
    }

    _getAllComponentsofType(componentType, component) {
        let out = [];
        out.push(...component.children.filter((child) => child.type === componentType));
        component.children.forEach((child) => out.push(...this._getAllComponentsofType(componentType, child)));
        return out;
    }

    getOriginsForNewGrowth(subtype) {
        return this._getOriginForNewGrowth(subtype, this.originGrowth);
    }

    _getOriginForNewGrowth(subtype, component) {
        let out = new Array();
        out.push(...component.lifeSquares.filter((sq) => sq.subtype == subtype))
        component.children.forEach((child) => out.push(...this._getOriginForNewGrowth(subtype, child)));
        return out;
    }

    addSproutGrowthPlan() {
        let rootLsq = new RootLifeSquare(this.linkedSquare, this);
        rootLsq.subtype = SUBTYPE_ROOTNODE;
        this.rootLifeSquares.push(rootLsq);
        let growthPlan = new GrowthPlan(
            true, STAGE_JUVENILE, TYPE_HEART, 0, 0, 0,
            0, 0, 0, 10 ** 8);
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let heartLsq = new PlantLifeSquare(this);
                heartLsq.subtype = SUBTYPE_HEART;
                this.greenLifeSquares.push(heartLsq);
                return heartLsq;
            }
        ));
        growthPlan.postConstruct = () => this.originGrowth = growthPlan.component;
        this.growthPlans.push(growthPlan);
    }

    getCurGrowthFrac() {
        return this.greenLifeSquares
            .map((lsq) => 1)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ) / Math.max(1, this.growthNumGreen);
    }

    lightLevelThrottleVal() {
        let ratio = this.lightlevel / this.growthLightLevel;
        if (ratio < this.llt_min()) {
            return this.llt_throttlValMax();
        } else if (ratio < 1) {
            let t = (ratio - this.llt_min()) / this.llt_min();
            return this.llt_throttlValMax() * (1 - t) + this.llt_throttlValMin() * t;
        } else if (ratio < this.llt_max()) {
            let t = (ratio - 1);
            return this.llt_throttlValMax() * t + this.llt_throttlValMin() * (1 - t);
        } else {
            return this.llt_throttlValMax();
        }
    }
    doGreenGrowth() {
        // -- Growth rate throttling method
        // if (this.age < this.greenLastGrown + this.lightLevelThrottleVal() * (this.getGrowthCycleMaturityLength() / this.growthNumGreen)) {
        //     return false;
        // }

        let somethingDone = false;
        this.growthPlans.filter((gp) => !gp.areStepsCompleted()).forEach((growthPlan) => {
            growthPlan.steps.filter((step) => !step.completed).at(0).doAction();
            growthPlan.complete();
            somethingDone = true;
            this.curNumGreen += 1;
            this.greenLastGrown = this.age;
            if (growthPlan.areStepsCompleted()) {
                this.stage = growthPlan.endStage;
            }
            if (growthPlan.required && growthPlan.steps.some((step) => step.completedLsq == null)) {
                this.destroy();
            }
        });
        return somethingDone;
    }

    doRootGrowth() {
        let curMaturityLifeFrac = this.age / this.getGrowthCycleMaturityLength();
        if (this.stage == STAGE_FLOWER || curMaturityLifeFrac >= 1)
            return;

        if (this.curNumRoots < this.growthNumRoots)
            this.growOptimalRoot();
    }

    growRoot(f) {
        let dRoot = this.age - this.rootLastGrown;
        let rootThrottlInterval = this.getGrowthCycleMaturityLength() / this.growthNumRoots;
        if (dRoot < rootThrottlInterval)
            return;

        let targetSquare = null;
        let targetSquareParent = null;
        this.rootLifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => {
            getNeighbors(lsq.posX, lsq.posY)
                .filter((_sq) => _sq != null)
                .filter((_sq) => _sq.rootable)
                .filter((_sq) => _sq.blockHealth == _sq.blockHealthMax)
                .filter((_sq) => !(_sq.linkedOrganismSquares.some((llsq => llsq.linkedOrganism.proto == this.proto))))
                .filter((_sq) => targetSquare == null || f(targetSquare) < f(_sq))
                .forEach((_sq) => { targetSquare = _sq; targetSquareParent = lsq });
        });
        if (targetSquare == null) {
            return;
        }

        let newRootLifeSquare = new RootLifeSquare(targetSquare, this);
        this.rootLifeSquares.push(lifeSquare);
        newRootLifeSquare.linkSquare(targetSquare);
        targetSquareParent.addChild(newRootLifeSquare)
        targetSquare.linkOrganismSquare(newRootLifeSquare);

        this.rootLastGrown = this.age;
        this.curNumRoots += 1;
    }

    spawnSeed() {
        console.log("Would spawn seed")
    }

    doSpawnSeed() {
        if (this.stage == STAGE_FLOWER) {
            this.spawnSeed();
        }
    }

    growOptimalRoot() {
        // TODO: This score function. 
        // Commits before 3/7/26 have the previous nutrition implementation.
        let scoreFunc = (sq) => {
            let sqScore = 0;
            if (this.waterPressure < this.waterPressureSoilTarget()) {
                sqScore += sq.getSoilWaterPressure() - this.waterPressureSoilTarget();
            } else {
                sqScore += this.waterPressureSoilTarget() - sq.getSoilWaterPressure();
            }
            return sqScore;
        }
        this.growRoot(scoreFunc);
    }

    // ** PLAN GROWTH METHOD IMPLEMENTED BY ORGANISMS 
    // for green growth, roots are handled generically (for now)
    planGrowth() {
        if (Math.abs(this.getWilt()) > .5)
            // return false;

        if (this.growthPlans.some((gp) => !gp.areStepsCompleted())) {
            this.doGreenGrowth();
            return false;
        }
        if (this.stage == STAGE_SPROUT) {
            this.addSproutGrowthPlan();
            return false;
        }
        return true;
    }

    prepareRender() {

    }

    render() {
        this.prepareRender();
        
        this.greenLifeSquares.forEach((lsq) => lsq.render());
    }

    setNutrientIndicators() {
        let compareFunc = (lsq) => {
            let relLsqX = (this.linkedSquare.posX - lsq.posVec[0]);
            let relLsqY = (this.linkedSquare.posY - lsq.posVec[1]);
            let relLsqZ = (this.linkedSquare.z - lsq.posVec[2]);
            return (relLsqX ** 2 + relLsqY ** 2 + relLsqZ ** 2) ** 0.5;
        }
        this.greenLifeSquares.sort((a, b) => compareFunc(a) - compareFunc(b));

        let lifetimeFrac = this.age / this.getGrowthCycleLength() * this.numGrowthCycles;
        let lightLevelMult = Math.min(2, this.lightlevel / this.growthLightLevel) * this.greenLifeSquares.length;
        let lifetimeMult = lifetimeFrac * this.greenLifeSquares.length;

        this.greenLifeSquares.forEach((lsq) => {
            lsq.lightlevelIndicated = 0;
            lsq.lifetimeIndicated = 0;
        });

        for (let i = 0; i < (this.greenLifeSquares.length * 2); i++) {
            let lsq = this.greenLifeSquares[i % this.greenLifeSquares.length];
            let lightLevelToAdd = Math.min(lightLevelMult, 1)
            let lifetimeToAdd = Math.min(lifetimeMult, 1)

            lsq.lightlevelIndicated += lightLevelToAdd;
            lsq.lifetimeIndicated += lifetimeToAdd;

            lightLevelMult -= lightLevelToAdd;
            lifetimeMult -= lifetimeToAdd;
        }
    }

    doDecay() {
        if (this.stage != STAGE_DEAD) {
            return;
        }
        this.deathProgress += .01;
        if (this.originGrowth == null || this.deathProgress >= 1) {
            this.destroy();
        }
    }

    // DESTRUCTION
    destroy() {
        this.greenLifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        this.rootLifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        this.seedLifeSquare?. destroy();
        
        if (this.linkedSquare != null && this.linkedSquare != -1) {
            this.linkedSquare.unlinkOrganism(this);
        }
    }

    hasPlantLivedTooLong() {
        if (this.stage == STAGE_DEAD) {
            return;
        }
        if (this.age > this.getGrowthCycleLength() * this.numGrowthCycles) {
            this.stage = STAGE_DEAD;
            return;
        }
    }

    plantAgeHandling() {
        this.age += getDt();
    }

    // ** OUTER TICK METHOD INVOKED EACH FRAME
    // -- these methods are universal to every organism
    process() {
        if (this.stage != STAGE_DEAD) {
            this.plantAgeHandling();
            this.waterPressureTick();
            this.nutrientTick();
            this.planGrowth();
            this.doRootGrowth();
            this.doSpawnSeed();
        }
        this.updateRenderingState();
        this.hasPlantLivedTooLong();
        this.doDecay();
    }
}

export { BasePlant }