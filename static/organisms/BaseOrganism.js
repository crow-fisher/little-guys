import { removeOrganism } from "./_orgOperations.js";
import { getCurDay, getDt } from "../climate/time.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_ROOTNODE, TYPE_HEART } from "./Stages.js";
import { addSquare, getNeighbors } from "../squares/_sqOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { applyLightingFromSource } from "../lighting/lightingProcessing.js";
import { loadGD, UI_GODMODE_FASTPLANT, UI_SIMULATION_GENS_PER_DAY, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_SELECT } from "../ui/UIData.js";
import { RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "../colors.js";
import { removeItemAll, rgbToRgba } from "../common.js";

class BaseOrganism {
    constructor(square) {
        this.proto = "BaseOrganism";
        this.posX = square.posX;
        this.posY = square.posY;
        this.stage = STAGE_SPROUT;
        this.originGrowth = null;
        this.spinnable = false;

        this.lifeSquares = new Array();
        this._lifeSquaresCount = -1;
        this.growthPlans = [];
        this.lastGrownMap = {};
        this.linkSquare(square);
        this.spawnTime = getCurDay();
        this.rootLastGrown = 0;
        this.greenLastGrown = 0;
        this.curLifeTimeOffset = 0;

        this.evolutionParameters = null;

        this.greenType = null;
        this.rootType = null;

        this.waterPressureOverwaterThresh = 1
        this.waterPressureTarget = 0;
        this.waterPressureWiltThresh = -1;
        this.waterPressure = 0;
        this.waterPressureChangeRate = .01;
        this.waterPressureSoilTarget = -4;
        this.waterPressureLossRate = 30000;

        // nutrients normalized to "pounds per acre" per farming websites
        this.ph = 7;
        this.nitrogen = 0;
        this.phosphorus = 0;
        this.lightlevel = 0;
        this.lightDamageCount = 0;

        this.growthNumGreen = 20;
        this.growthNumRoots = 30;
        this.growthNitrogen = 50;
        this.growthPhosphorus = 25;
        this.growthLightLevel = 0.5;
        this.growthCycleMaturityLength = 1;
        this.growthCycleLength = 1.5;
        this.numGrowthCycles = 1;

        this.curNumRoots = 0;
        this.curNumGreen = 0;

        this.applyWind = false;
        this.springCoef = 4;
        this.startDeflectionAngle = 0;
        this.lastDeflectionStateRollingAverage = 0;
        this.lastDeflectionStateThetaRollingAveragePeriod = 1000;
        this.deflectionIdx = 0;
        this.deflectionStateTheta = 0;
        this.rootOpacity = 0.15;
        this.lighting = square.lighting;
        this.evolutionParameters = [0.5];
        this.deathProgress = 0;

        this.evolutionMinColor = RGB_COLOR_BLUE;
        this.evolutionMaxColor = RGB_COLOR_VERY_FUCKING_RED;
    }

    prepareForSave() {
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
        return this.processColor(this.evolutionMinColor, this.evolutionMaxColor, this.evolutionParameters.at(0), 1, opacity);
    }

    getGrowthCycleLength() {
        return (this.growthCycleLength / loadGD(UI_SIMULATION_GENS_PER_DAY));
    }
    getGrowthCycleMaturityLength() {
        return (this.growthCycleMaturityLength / loadGD(UI_SIMULATION_GENS_PER_DAY));
    }
    getGrowthLightLevel() {
        return this.growthLightLevel;
    }

    setEvolutionParameters(evolutionParameters) {
        this.evolutionParameters = evolutionParameters;
        this.processGenetics();
    }

    getNextGenetics() {
        return Array.from(this.evolutionParameters.map((v) => {
            if (v === 1 || v === 0)
                return v;
            v = v + (Math.random() - 0.5) * .2;
            return Math.min(Math.max(0.0001, v), 0.9999);
        }));
    }

    processGenetics() { } // fill this out in your implementation class!


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
        this.waterPressure += this.waterPressureChangeRate * roots.filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .map((lsq) => {
                let sq = lsq.linkedSquare;
                let sqWaterPressure = sq.getSoilWaterPressure();
                let diffToTarget = sqWaterPressure - this.waterPressureSoilTarget;
                if (diffToTarget <= 0) {
                    return 0;
                }
                sq.waterContainment -= (2 / (numRoots * this.waterPressureLossRate));
                return (diffToTarget / numRoots);
            })
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        this.waterPressure -= this.waterPressureChangeRate;

        if (this.waterPressure > this.waterPressureTarget) {
            this.waterPressure -= 5 * this.getWilt() * this.waterPressureChangeRate;
        }
    }

    nutrientTick() {
        let growthCycleFrac = getDt() / this.getGrowthCycleMaturityLength();

        let targetPerRootNitrogen = growthCycleFrac * (1 / 2) * this.growthNitrogen * (1 / this.growthNumRoots ** 0.8)
        let targetPerRootPhosphorus = growthCycleFrac * (1 / 2) * this.growthPhosphorus * (1 / this.growthNumRoots ** 0.8)

        this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .forEach((lsq) => {
                this.nitrogen += this.wiltEfficiency() * lsq.linkedSquare.takeNitrogen(targetPerRootNitrogen);
                this.phosphorus += this.wiltEfficiency() * lsq.linkedSquare.takePhosphorus(targetPerRootPhosphorus);
            });

        this.lifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => [lsq.processLighting(), lsq.lightHealth ** 4])
            .map((argb) => argb[1] * (argb[0].r + argb[0].b) / (255 * 2))
            .forEach((lightlevel) => this.addNutrient("lightlevel", "curNumGreen", lightlevel))
    }

    addNutrient(ref, curCountRef, val) {
        let c = this[curCountRef]
        this[ref] = this[ref] * (c - 1) / c + (val / c);
    }

    wiltEfficiency() {
        return (1 - Math.abs(this.getWilt()));
    }

    getWilt() {
        if (this.lifeSquares.length == 0) {
            return;
        }
        let greenLifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green"));
        if (greenLifeSquares.length == 0) {
            return 0;
        }
        if (this.waterPressure > this.waterPressureTarget) {
            return Math.min(1, (this.waterPressure - this.waterPressureTarget) / (this.waterPressureOverwaterThresh - this.waterPressureTarget));
        } else if (this.waterPressure > this.waterPressureWiltThresh) {
            return (this.waterPressure - this.waterPressureWiltThresh) / (this.waterPressureTarget - this.waterPressureWiltThresh) - 1;
        } else {
            return -1;
        }
    }

    // PHYSICAL SQUARES
    linkSquare(square) {
        this.linkedSquare = square;
        square.linkOrganism(this);
    }
    unlinkSquare() {
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

    growGreenSquareAction(startNode, subtype) {
        let newGrassNode = this.growPlantSquare(startNode, 0, 0);
        newGrassNode.subtype = subtype;
        return newGrassNode;
    }

    addSproutGrowthPlan() {
        if (!this.linkedSquare.surface) {
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
                }
                this.addAssociatedLifeSquare(rootSq);
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
        if (this.lightlevel < this.growthLightLevel * 0.7) {
            return 2;
        } else if (this.lightlevel < this.growthLightLevel * 1.3) {
            return 1
        } else {
            return 2;
        }
    }

    doGreenGrowth() {
        if (getCurDay() < this.greenLastGrown + this.lightLevelThrottleVal() * (this.getGrowthCycleMaturityLength() / this.growthNumRoots)) {
            // return;
        }

        this.growthPlans.filter((gp) => !gp.areStepsCompleted()).forEach((growthPlan) => {
            growthPlan.steps.filter((step) => !step.completed).at(0).doAction();
            growthPlan.complete();
            this.curNumGreen += 1;
            this.greenLastGrown = getCurDay();

            if (this.originGrowth != null) {
                // this.originGrowth.updateDeflectionState();
                this.originGrowth.applyDeflectionState();
            }
            if (growthPlan.areStepsCompleted()) {
                this.stage = growthPlan.endStage;
            }
            if (growthPlan.required && growthPlan.steps.some((step) => step.completedSquare == null)) {
                this.destroy();
            }
        });
    }

    doRootGrowth() {
        let curLifeFrac = Math.min(1, this.getAge() / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = (curLifeFrac ** 2) * this.growthNitrogen;
        let expectedPhosphorus = (curLifeFrac ** 2) * this.growthPhosphorus;
        if (this.nitrogen < expectedNitrogen || this.phosphorus < expectedPhosphorus) {
            this.growOptimalRoot();
        }
    }

    growRoot(f) {
        if (getCurDay() < this.rootLastGrown + (this.getGrowthCycleMaturityLength() / this.growthNumRoots)) {
            return;
        }

        if (this.curNumRoots > this.growthNumRoots * 2) {
            return;
        }
        if (this.curNumRoots > this.curNumGreen) {
            return;
        }

        this.rootLastGrown = getCurDay();
        this.curNumRoots += 1;

        let targetSquare = null;
        let targetSquareParent = null;
        this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => {
            getNeighbors(lsq.posX, lsq.posY)
                .filter((_sq) => _sq != null)
                .filter((_sq) => _sq.rootable)
                .filter((_sq) => !(_sq.linkedOrganismSquares.some((llsq => llsq == null))))
                .filter((_sq) => !(_sq.linkedOrganismSquares.some((llsq => llsq.linkedOrganism == this))))
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
    }

    getAge() {
        return (getCurDay() - this.spawnTime) - this.curLifeTimeOffset;
    }

    spawnSeed() {
        console.log("Would spawn seed")
    }

    doSpawnSeed() {
        let curMaturityFrac = this.getAge() / this.getGrowthCycleMaturityLength();
        if (curMaturityFrac > 1) {
            if (this.nitrogen > this.growthNitrogen && this.phosphorus > this.growthPhosphorus && this.lightlevel > this.getGrowthLightLevel()) {
                this.spawnSeed();
            }
        }
    }

    growOptimalRoot() {
        let curMaturityFrac = Math.min(1, this.getAge() / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = curMaturityFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = curMaturityFrac ** 2 * this.growthPhosphorus;
        let scoreFunc = (sq) => {
            let sqScore = 0;
            if (this.waterPressure < this.waterPressureTarget) {
                sqScore += sq.getSoilWaterPressure() - this.waterPressureSoilTarget;
            }
            if (this.nitrogen < expectedNitrogen) {
                sqScore += (sq.nitrogen / this.growthNitrogen) / (sq.linkedOrganismSquares.length + 1);
            }
            if (this.phosphorus < expectedPhosphorus) {
                sqScore += (sq.phosphorus / this.growthPhosphorus) / (sq.linkedOrganismSquares.length + 1);
            }
        }
        this.growRoot(scoreFunc);
    }

    // ** PLAN GROWTH METHOD IMPLEMENTED BY ORGANISMS 
    // for green growth, roots are handled generically (for now)
    planGrowth() {
        if (this.growthPlans.some((gp) => !gp.areStepsCompleted())) {
            this.doGreenGrowth();
            return;
        }
        if (this.stage == STAGE_SPROUT) {
            this.addSproutGrowthPlan();
        }
    }


    // RENDERING
    render() {
        if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_NUTRIENTS || loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_LIGHTING) {
            this.setNutrientIndicators();
        }
        if (this.stage != STAGE_DEAD) {
            this.lifeSquares.forEach((sp) => sp.render())
        }
    }

    setNutrientIndicators() {
        let compareFunc = (lsq) => {
            let relLsqX = (this.posX - lsq.posX);
            let relLsqY = (this.posY - lsq.posY);
            return (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
        }
        this.lifeSquares.sort((a, b) => compareFunc(a) - compareFunc(b));

        let maturityLifeFrac = Math.min(1, this.getAge() / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = maturityLifeFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = maturityLifeFrac ** 2 * this.growthPhosphorus;

        let nitrogenMult = Math.min(1, this.nitrogen / expectedNitrogen) * this.lifeSquares.length;
        let phosphorusMult = Math.min(1, this.phosphorus / expectedPhosphorus) * this.lifeSquares.length;
        let lightLevelMult = Math.min(1, this.lightlevel / this.growthLightLevel) * this.lifeSquares.length;

        this.lifeSquares.forEach((sq) => {
            sq.nitrogenIndicated = 0;
            sq.lightlevelIndicated = 0;
            sq.phosphorusIndicated = 0;
        });

        for (let i = 0; i < this.lifeSquares.length; i++) {
            let sq = this.lifeSquares[i % this.lifeSquares.length];
            let nitrogenToAdd = Math.min(nitrogenMult, 1);
            let phosphorusToAdd = Math.min(phosphorusMult, 1)
            let lightLevelToAdd = Math.min(lightLevelMult, 1)

            sq.nitrogenIndicated += nitrogenToAdd;
            sq.phosphorusIndicated += phosphorusToAdd;
            sq.lightlevelIndicated += lightLevelToAdd;

            nitrogenMult -= nitrogenToAdd;
            phosphorusMult -= phosphorusToAdd;
            lightLevelMult -= lightLevelToAdd;
        }
    }

    doDecay() {
        if (this.stage != STAGE_DEAD) {
            return;
        }
        this.deathProgress += (getDt()) * (loadGD(UI_SIMULATION_GENS_PER_DAY) / 4);
        if (this.originGrowth == null || this.deathProgress >= 1) {
            this.destroy();
        }
    }

    // DESTRUCTION
    destroy() {
        console.log("Organism dying; state: ",
            this.proto,
            "light:",
            this.lightlevel,
            this.growthLightLevel,
            "nitogen:",
            this.nitrogen,
            this.growthNitrogen,
            "phosphorus:",
            this.phosphorus,
            this.growthPhosphorus
        );

        this.lifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        if (this.linkedSquare != null && this.linkedSquare != -1) {
            this.linkedSquare.unlinkOrganism();
        }
        removeOrganism(this);
    }

    hasPlantLivedTooLong() {
        if (this.stage == STAGE_DEAD) {
            return;
        }
        if (this.getAge() > this.getGrowthCycleLength() * this.numGrowthCycles) {
            this.stage = STAGE_DEAD;
            return;
        }
        if (this.stage == STAGE_ADULT && this.getAge() > this.getGrowthCycleMaturityLength()) {
            this.stage = STAGE_FLOWER;
            return;
        }
    }

    // ** OUTER TICK METHOD INVOKED EACH FRAME
    // -- these methods are universal to every organism
    process() {
        if (this.stage != STAGE_DEAD) {
            this.waterPressureTick();
            this.nutrientTick();
            this.planGrowth();
            this.doRootGrowth();
            this.doSpawnSeed();
        }
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
        this.hasPlantLivedTooLong();
        this.doDecay();
        this.lifeSquares = this.lifeSquares.sort((a, b) => a.distToFront - b.distToFront);

    }
}

export { BaseOrganism }