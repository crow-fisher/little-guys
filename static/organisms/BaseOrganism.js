import { getCurDay, getDt } from "../climate/time.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_ROOTNODE, TYPE_HEART } from "./Stages.js";
import { addSquare, getNeighbors } from "../squares/sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { applyLightingFromSource } from "../lighting/lightingProcessing.js";
import { loadGD, UI_EVOLUTION_ACTIVE_PARAM, UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA, UI_ORGANISM_SELECT, UI_SIMULATION_GENS_PER_DAY, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT } from "../ui/UIData.js";
import { COLOR_BLACK, RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "../colors.js";
import { clamp, randNumber, randRange, rgbToRgba } from "../common.js";
import { MAIN_CONTEXT } from "../index.js";
import { zoomCanvasFillRect } from "../canvas.js";
import { HUE_GREEN } from "../hue.js";
import { SeedSquare } from "../squares/SeedSquare.js";
import { getNextBlockId, getNextOrgId } from "../globals.js";

export const _llt_mult = "_llt_mult";
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
    _llt_mult: 2.35,
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

class BaseOrganism {
    constructor(square, parentId) {
        this.id = getNextOrgId();
        this.spawnTime = getCurDay();
        this.parentId = parentId;

        this.proto = "BaseOrganism";
        this.uiRef = UI_ORGANISM_SELECT;
        this.posX = square?.posX;
        this.posY = square?.posY;
        this.stage = STAGE_SPROUT;
        this.originGrowth = null;
        this.spinnable = false;

        this.orgInfoHue = HUE_GREEN; // Used in 'organismVisualizer' 
        this.lifeSquares = new Array();
        this._lifeSquaresCount = -1;
        this.growthPlans = [];
        this.lastGrownMap = {};
        this.linkSquare(square);
        this.age = 0;
        this.rootLastGrown = 0;
        this.greenLastGrown = -100;

        this.evolutionParameters = null;
        this.evolutionLightingOffset = 0;
        this.evolutionMoistureOffset = 0;

        this.greenType = null;
        this.rootType = null;

        this.waterPressure = 0;
        this.waterPressureChangeRate = .01;

        this.growthNumGreen = 20;
        this.growthNumRoots = 30;
        this.growthNitrogen = 50;
        this.growthPhosphorus = 25;
        this.growthLightLevel = 1;
        this.growthCycleMaturityLength = 1;
        this.growthCycleLength = 1.5;
        this.numGrowthCycles = 1;

        this.nitrogen = 0;
        this.phosphorus = 0;
        this.lightLevel = 0;

        this.curNumRoots = 0;
        this.curNumGreen = 0;

        this.rootOpacity = 0.15;
        this.lighting = square?.lighting;
        this.evolutionParameters = [0.5, 0.5];
        this.deathProgress = 0;

        this.evolutionMinColor = RGB_COLOR_BLUE;
        this.evolutionMaxColor = RGB_COLOR_VERY_FUCKING_RED;

        this.organismColor = COLOR_BLACK;
        this.organismViewHsvBase = [166, 95, 95];
    }

    getGrowthLightLevel() {
        return this.growthLightLevel + this.evolutionLightingOffset;
    }

    getWaterPressureSoilTarget() {
        return this.waterPressureSoilTarget() + this.evolutionMoistureOffset;
    }

    getSeedType() {
        return null;
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
    llt_mult() {
        return this.getGenericNutritionParam(_llt_mult);
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
    seedReduction() {
        return this.getGenericNutritionParam(_seedReduction);
    }
    lightDecayValue() {
        return this.getGenericNutritionParam(_lightDecayValue);
    }
    waterPressureSoilTarget() {
        return this.getGenericNutritionParam(_waterPressureSoilTarget);
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

    processColor(color1, color2, value, valueMax, opacity) {
        let frac = value / valueMax;
        let outColor = {
            r: color1.r * frac + color2.r * (1 - frac),
            g: color1.g * frac + color2.g * (1 - frac),
            b: color1.b * frac + color2.b * (1 - frac)
        }
        return rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacity);
    }

    getEvolutionColor(opacity) {
        return this.processColor(this.evolutionMinColor, this.evolutionMaxColor, this.evolutionParameters.at(loadGD(UI_EVOLUTION_ACTIVE_PARAM)), 1, opacity);
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


    getNextEvolutionParameter(start, cur, target) {
        let range = 0.02;
        let half = range / 2;
        if (Math.abs(cur - target) < half) {
            // we are within the threshold of our variability. 
            // return a nearby value.
            return start + randRange(-half, half);
        } else if (cur - target > 0) {
            // our current light level is too high. 
            // return a new, higher value.
            return start + randRange(-range / 2, range);
        } else {
            return start - randRange(-range / 2, range);
        }
    }

    /**
     *  Default genetics set two parameters: 
        - Target Light Level (`evolutionLightingOffset`)
        - Target Moisture Level (`evolutionMoistureOffset`)

        You are welcome to include as many as you like in your implementation classes.
     */
    getNextGenetics() {
        let ret = structuredClone(this.evolutionParameters);
        ret[0] = clamp(this.getNextEvolutionParameter(ret[0], this.lightLevel, this.getGrowthLightLevel()));
        ret[1] = clamp(this.getNextEvolutionParameter(ret[1], this.waterPressure, this.getWaterPressureSoilTarget()));
        return ret;
    }

    processGenetics() {
        this.evolutionLightingOffset = -.5 + this.evolutionParameters[0];
        this.evolutionMoistureOffset = 0.35 * (-.5 + this.evolutionParameters[1]);

        // let p0 = this.evolutionParameters[0];
        // this.growthLightLevel *= (1 + 1.4 * p0);

    } // fill this out in your implementation class!


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

    // WATER SATURATION AND NUTRIENTS 

    waterPressureTick() {
        let roots = this.lifeSquares
            .filter((lsq) => lsq.type == "root");
        let numRoots = roots.map((lsq) => 1).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0);


        let target = this.getWaterPressureSoilTarget();
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

        if (numRoots > 0)
            this.waterPressure += (1 / numRoots) * this.waterPressureChangeRate * roots.filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
                .map((lsq) => {
                    let sq = lsq.linkedSquare;
                    let sqWaterPressure = sq.getSoilWaterPressure();
                    let diffToTarget = sqWaterPressure - this.getWaterPressureSoilTarget();
                    if (diffToTarget <= 0) {
                        return 0;
                    }

                    let amount = diffToTarget;
                    if (this.waterPressure > target)
                        amount /= waterPressureLossRate;

                    return amount;
                })
                .reduce((a, b) => a + b, 0);
    }

    lsqWaterPressure(val) {
        let c = this.curNumRoots;
        this.waterPressure = this.waterPressure * (c - 1) / c + (val / c);
    }

    nutrientTick() {
        let growthCycleFrac = getDt() / this.getGrowthCycleMaturityLength();
        let mult = growthCycleFrac * this.wiltEfficiency() / (2 * this.lightLevelThrottleVal() * (this.growthNumRoots ** 0.7));
        let targetPerRootNitrogen = mult * this.growthNitrogen;
        let targetPerRootPhosphorus = mult * this.growthPhosphorus;

        let someGreen = this.lifeSquares.some((lsq) => lsq.type == "green");

        this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .forEach((lsq) => {
                this.nitrogen += lsq.linkedSquare.takeNitrogen(targetPerRootNitrogen, this.proto);
                this.phosphorus += lsq.linkedSquare.takePhosphorus(targetPerRootPhosphorus, this.proto);
                this.lsqWaterPressure(lsq.linkedSquare.getSoilWaterPressure())
                if (!someGreen) {
                    let argb = lsq.linkedSquare.processLighting();
                    this.lsqLightLevel((argb.r + argb.b) / (255 * 2));
                }
            });

        this.lifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => lsq.processLighting())
            .map((argb) => this.lsqLightLevel((argb.r + argb.b) / (255 * 2)));
    }

    lsqLightLevel(val) {
        val *= this.llt_mult();
        let c = this.curNumGreen;
        this.lightLevel = this.lightLevel * (c - 1) / c + (val / c);
    }

    lsqWaterPressure(val) {
        let c = this.curNumRoots;
        this.waterPressure = this.waterPressure * (c - 1) / c + (val / c);
    }
    
    wiltEfficiency() {
        return (1 - Math.abs(this.getWilt()));
    }

    getWilt() {
        if (this.lifeSquares.length == 0) {
            return 0;
        }
        let greenLifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green"));
        if (greenLifeSquares.length == 0) {
            return 0;
        }

        let target = this.getWaterPressureSoilTarget();
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
        if (square == null) {
            return;
        }
        this.linkedSquare = square;
        square.linkOrganism(this);
    }
    unlinkSquare(deep = true) {
        if (deep && this.linkedSquare != null) {
            this.linkedSquare.unlinkOrganism(this);
        }
        this.linkedSquare = null;
    }

    // LIFE SQUARES
    addAssociatedLifeSquare(lifeSquare) {
        this.lifeSquares.push(lifeSquare);
        let pred = (lsq) => lsq.lighting != null && lsq.lighting.length > 0;
        if (this.lifeSquares.some(pred)) {
            lifeSquare.lighting = this.lifeSquares.reverse().find(pred).lighting;
        }
    }
    removeAssociatedLifeSquare(lifeSquare) {
        this.lifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq != lifeSquare));
        lifeSquare.destroy();
    }

    // COMPONENT GROWTH
    growPlantSquare(parentSquare, dx, dy) {
        let newPlantSquare = new PlantSquare(parentSquare.posX + dx, parentSquare.posY - dy);
        if (addSquare(newPlantSquare)) {
            let newGreenSquare = new this.greenType(newPlantSquare, this);
            this.addAssociatedLifeSquare(newGreenSquare);
            newGreenSquare.linkSquare(newPlantSquare);
            parentSquare.addChild(newPlantSquare);
            newGreenSquare.lighting = new Array();

            let refSquare = null;
            if (parentSquare.lighting.length > 0) {
                refSquare = parentSquare;
            } else {
                for (let i = this.lifeSquares.length - 1; i >= 0; i--) {
                    let lsq = this.lifeSquares.at(i);
                    if (lsq.lighting.length > 0) {
                        refSquare = lsq;
                        break;
                    }
                }
                if (refSquare == null) {
                    refSquare = this.linkedSquare;
                }
            }
            applyLightingFromSource(refSquare, newGreenSquare);
            return newGreenSquare;
        }
        return null;
    }

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

    growGreenSquareAction(startNode, subtype, dy = 0) {
        let newGrassNode = this.growPlantSquare(startNode, 0, dy);
        newGrassNode.subtype = subtype;
        return newGrassNode;
    }

    addSproutGrowthPlan() {
        if (this.linkedSquare == null || !this.linkedSquare.surface) {
            this.destroy();
            return;
        }
        let growthPlan = new GrowthPlan(this.posX, this.posY,
            true, STAGE_JUVENILE, Math.PI / 2, 0, 0,
            0, 0, TYPE_HEART, 10 ** 8);
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let rootSq = new this.rootType(this.linkedSquare, this);
                rootSq.linkSquare(this.linkedSquare);
                rootSq.subtype = SUBTYPE_ROOTNODE;
                if (this.linkedSquare != null && this.linkedSquare != -1) {
                    this.linkedSquare.linkOrganismSquare(rootSq);
                    this.waterPressure = this.linkedSquare.getSoilWaterPressure();
                }
                this.addAssociatedLifeSquare(rootSq);
                this.curNumRoots += 1;
                return rootSq;
            }
        ));
        growthPlan.postConstruct = () => this.originGrowth = growthPlan.component;
        this.growthPlans.push(growthPlan);
    }

    getCurGrowthFrac() {
        return this.lifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => 1)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ) / Math.max(1, this.growthNumGreen);
    }

    lightLevelThrottleVal() {
        let ratio = this.lightLevel / (this.getGrowthLightLevel());
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
        if (this.age < this.greenLastGrown + this.lightLevelThrottleVal() * (this.getGrowthCycleMaturityLength() / this.growthNumGreen)) {
            return false;
        }
        if (Math.abs(this.getWilt()) > .5)
            return false;

        let somethingDone = false;
        this.growthPlans.filter((gp) => !gp.areStepsCompleted()).forEach((growthPlan) => {
            growthPlan.steps.filter((step) => !step.completed).at(0).doAction();
            growthPlan.complete();
            somethingDone = true;
            this.curNumGreen += 1;
            this.greenLastGrown = this.age;

            if (this.originGrowth != null) {
                this.originGrowth.updateDeflectionState();
                this.originGrowth.applyDeflectionState();
            }
            if (growthPlan.areStepsCompleted()) {
                this.stage = growthPlan.endStage;
            }
            if (growthPlan.required && growthPlan.steps.some((step) => step.completedSquare == null)) {
                this.destroy();
            }
        });
        return somethingDone;
    }

    doRootGrowth() {
        let curMaturityLifeFrac = this.age / this.getGrowthCycleMaturityLength();
        if (this.stage == STAGE_FLOWER || curMaturityLifeFrac >= 1)
            return;

        let expectedNitrogen = (curMaturityLifeFrac ** 2) * this.growthNitrogen;
        let expectedPhosphorus = (curMaturityLifeFrac ** 2) * this.growthPhosphorus;
        if (this.nitrogen < expectedNitrogen || this.phosphorus < expectedPhosphorus) {
            this.growOptimalRoot();
        }
    }

    growRoot(f) {
        let dRoot = this.age - this.rootLastGrown;
        let rootThrottlInterval = this.getGrowthCycleMaturityLength() / this.growthNumRoots;
        if (dRoot < rootThrottlInterval)
            return;

        let targetSquare = null;
        let targetSquareParent = null;
        this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => {
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

        let newRootLifeSquare = new this.rootType(targetSquare, this);
        this.addAssociatedLifeSquare(newRootLifeSquare);
        newRootLifeSquare.linkSquare(targetSquare);
        targetSquareParent.addChild(newRootLifeSquare)
        targetSquare.linkOrganismSquare(newRootLifeSquare);

        this.rootLastGrown = this.age;
        this.curNumRoots += 1;
    }

    spawnSeed() {
        if (this.originGrowth == null || (this.growthPlans.some((gp) => !gp.areStepsCompleted())) || this.targetGrassLength != this.maxGrassLength)
            return;
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 10));
        if (seedSquare) {
            seedSquare.speedX = randRange(-1, 1);
            seedSquare.speedY = randRange(-1.5, 1);
            let orgAdded = new (this.getSeedType())(seedSquare, this.getNextGenetics(), this.id);
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.lifeSquares.at(0), orgAdded.lifeSquares.at(0));
                this.nitrogen *= (1 - this.seedReduction());
                this.phosphorus *= (1 - this.seedReduction());
            }
        }
    }

    doSpawnSeed() {
        if (this.nitrogen > this.growthNitrogen && this.phosphorus > this.growthPhosphorus) {
            this.spawnSeed();
        }
    }

    growOptimalRoot() {
        let curMaturityFrac = Math.min(1, this.age / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = curMaturityFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = curMaturityFrac ** 2 * this.growthPhosphorus;
        let scoreFunc = (sq) => {
            let sqScore = 0;
            if (this.waterPressure < this.getWaterPressureSoilTarget()) {
                sqScore += sq.getSoilWaterPressure() - this.getWaterPressureSoilTarget();
            }
            if (this.nitrogen < expectedNitrogen) {
                sqScore += (sq.nitrogen / this.growthNitrogen) * sq.getNutrientRate(this.proto)
            }
            if (this.phosphorus < expectedPhosphorus) {
                sqScore += (sq.phosphorus / this.growthPhosphorus) * sq.getNutrientRate(this.proto)
            }
        }
        this.growRoot(scoreFunc);
    }

    // ** PLAN GROWTH METHOD IMPLEMENTED BY ORGANISMS 
    // for green growth, roots are handled generically (for now)
    planGrowth() {
        if (this.getWilt() <= -0.5) {
            return;
        }
        if (this.growthPlans.some((gp) => !gp.areStepsCompleted())) {
            this.doGreenGrowth();
            return false;
        }
        if (this.stage == STAGE_SPROUT) {
            this.addSproutGrowthPlan();
        }
        return true;
    }


    // RENDERING
    render() {
        let mode = loadGD(UI_VIEWMODE_SELECT);
        if ([UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_ORGANISMS].indexOf(mode) != -1) {
            this.setNutrientIndicators();
        }
        if (this.stage != STAGE_DEAD) {
            this.lifeSquares.forEach((sp) => sp.render())
        }

        if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_ORGANISMS) {
            MAIN_CONTEXT.fillStyle = this.organismColor;
            zoomCanvasFillRect(this.posX, this.posY, 1, 1);
        }
    }

    setNutrientIndicators() {
        let compareFunc = (lsq) => {
            let relLsqX = (this.posX - lsq.posX);
            let relLsqY = (this.posY - lsq.posY);
            return (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
        }
        this.lifeSquares.sort((a, b) => compareFunc(a) - compareFunc(b));

        let maturityLifeFrac = Math.min(1, this.age / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = maturityLifeFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = maturityLifeFrac ** 2 * this.growthPhosphorus;
        let lifetimeFrac = this.age / this.getGrowthCycleLength() * this.numGrowthCycles;

        let nitrogenMult = Math.min(1, this.nitrogen / expectedNitrogen) * this.lifeSquares.length;
        let phosphorusMult = Math.min(1, this.phosphorus / expectedPhosphorus) * this.lifeSquares.length;
        let lightLevelMult = Math.min(2, this.lightLevel / this.getGrowthLightLevel()) * this.lifeSquares.length;
        let lifetimeMult = lifetimeFrac * this.lifeSquares.length;

        this.lifeSquares.forEach((lsq) => {
            lsq.nitrogenIndicated = 0;
            lsq.lightlevelIndicated = 0;
            lsq.phosphorusIndicated = 0;
            lsq.lifetimeIndicated = 0;
        });

        for (let i = 0; i < (this.lifeSquares.length * 2); i++) {
            let lsq = this.lifeSquares[i % this.lifeSquares.length];
            let nitrogenToAdd = Math.min(nitrogenMult, 1);
            let phosphorusToAdd = Math.min(phosphorusMult, 1)
            let lightLevelToAdd = Math.min(lightLevelMult, 1)
            let lifetimeToAdd = Math.min(lifetimeMult, 1)

            lsq.nitrogenIndicated += nitrogenToAdd;
            lsq.phosphorusIndicated += phosphorusToAdd;
            lsq.lightlevelIndicated += lightLevelToAdd;
            lsq.lifetimeIndicated += lifetimeToAdd;

            nitrogenMult -= nitrogenToAdd;
            phosphorusMult -= phosphorusToAdd;
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
        this.lifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
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
            this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => lsq.destroy());
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
            this.planGrowth();
            this.doRootGrowth();
            this.doSpawnSeed();
            this.nutrientTick();
        }
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
        this.hasPlantLivedTooLong();
        this.doDecay();

        this.lifeSquares = this.lifeSquares.sort((a, b) => a.distToFront - b.distToFront);
    }
}

export { BaseOrganism }