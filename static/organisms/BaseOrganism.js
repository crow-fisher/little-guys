import { removeOrganism } from "./_orgOperations.js";
import { randNumber } from "../common.js";
import { getCurDay, getCurTimeScale, getDt } from "../climate/time.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_DEAD, STAGE_JUVENILE, STAGE_SPROUT, STATE_DEAD, STATE_HEALTHY, STATE_THIRSTY, SUBTYPE_ROOTNODE, TYPE_HEART } from "./Stages.js";
import { addSquare, getNeighbors } from "../squares/_sqOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { applyLightingFromSource, processLighting } from "../lighting/lightingProcessing.js";
import { loadGD, UI_GODMODE_FASTPLANT, UI_SIMULATION_GENS_PER_DAY } from "../ui/UIData.js";

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
        this.rootLastGrown = getCurDay();
        this.curLifeTimeOffset = 0;

        this.evolutionParameters = null;

        this.greenType = null;
        this.rootType = null;

        this.waterPressureOverwaterThresh = 1
        this.waterPressureTarget = 0;
        this.waterPressureWiltThresh = -1;
        this.waterPressure = 0;
        this.waterPressureChangeRate = .01;
        this.waterPressureSoilTarget = -3;
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

        this.applyWind = false;
        this.springCoef = 4;
        this.startDeflectionAngle = 0;
        this.lastDeflectionStateRollingAverage = 0;
        this.lastDeflectionStateThetaRollingAveragePeriod = 1000;
        this.deflectionIdx = 0;
        this.deflectionStateTheta = 0;
        this.deflectionStateFunctions = [];
        this.rootOpacity = 0.15;
        this.lighting = square.lighting;
        this.evolutionParameters = [0.5];
        this.deathProgress = 0;
    }

    getGrowthCycleLength() {
        return this.growthCycleLength / loadGD(UI_SIMULATION_GENS_PER_DAY);
    }
    getGrowthCycleMaturityLength() {
        return this.growthCycleMaturityLength / loadGD(UI_SIMULATION_GENS_PER_DAY);
    }
    getGrowthLightLevel() {
        if (loadGD(UI_SIMULATION_GENS_PER_DAY) < 1) {
            return this.growthLightLevel * 0.4; // (because night)
        }
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
                    sq.waterContainment -= (1 / (numRoots * this.waterPressureLossRate));
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
            let targetPerRootNitrogen = this.growthNitrogen * growthCycleFrac / this.growthNumRoots;
            let targetPerRootPhosphorus = this.growthPhosphorus * growthCycleFrac / this.growthNumRoots;

        this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .forEach((lsq) => {
                this.nitrogen += this.wiltEfficiency() * lsq.linkedSquare.takeNitrogen(targetPerRootNitrogen, growthCycleFrac);
                this.phosphorus += this.wiltEfficiency() * lsq.linkedSquare.takePhosphorus(targetPerRootPhosphorus, growthCycleFrac);
            });

        this.lightlevel += this.lifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => [lsq.processLighting(), lsq.lightHealth ** 4])
            .map((argb) => argb[1] * (argb[0].r + argb[0].b) / (255 * 2))
            .map((lightlevel) => this.wiltEfficiency() * (lightlevel / this.growthNumGreen) * growthCycleFrac)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
    }

    wiltEfficiency() {
        return (.3) + 0.7 * (1 - Math.abs(this.getWilt()));
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
            let newGreenSquare = addOrganismSquare(new this.greenType(newPlantSquare, this));
            if (newGreenSquare) {
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
            0,
            0,
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

    executeGrowthPlans() {
        let curLifeFrac = this.getCurGrowthFrac();
        let requiredNitrogen = curLifeFrac * this.growthNitrogen;
        let requiredPhosphorus = curLifeFrac * this.growthPhosphorus;
        let requiredLightLevel = curLifeFrac * this.getGrowthLightLevel();

        if (this.nitrogen < requiredNitrogen || this.phosphorus < requiredPhosphorus || this.lightlevel < requiredLightLevel) {
            return;
        }
        let anyStepFound = false;
        this.growthPlans.filter((gp) => !gp.completed).forEach((growthPlan) => {
            let step = growthPlan.steps.filter((step) => !step.completed).at(0);
            step.doAction();
            step.growthPlan.stepLastExecuted = getCurDay();
            anyStepFound = true;

            if (this.originGrowth != null) {
                this.originGrowth.updateDeflectionState();
                this.originGrowth.applyDeflectionState();
            }

            if (growthPlan.areStepsCompleted()) {
                growthPlan.complete();
                this.stage = growthPlan.endStage;
            }

            if (growthPlan.required && growthPlan.steps.some((step) => step.completedSquare == null)) {
                this.destroy();
            }
        });
    }

    growRoot(f) {
        if (getCurDay() < this.rootLastGrown + (this.getGrowthCycleMaturityLength() / this.growthNumRoots)) {
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

        let newRootLifeSquare = addOrganismSquare(new this.rootType(targetSquare, this));
        if (newRootLifeSquare) {
            this.addAssociatedLifeSquare(newRootLifeSquare);
            newRootLifeSquare.linkSquare(targetSquare);
            targetSquareParent.addChild(newRootLifeSquare)
            targetSquare.linkOrganismSquare(newRootLifeSquare);
        }
    }

    getAge() {
        return (getCurDay() - this.spawnTime) - this.curLifeTimeOffset;
    }

    spawnSeed() {
        console.log("Would spawn seed")
    }

    doPlantGrowth() {
        if (!this.lifeSquares.some((lsq) => lsq.type == "green")) {
            this.executeGrowthPlans();
        }
        if (this.stage == STAGE_DEAD) {
            return;
        }
        let curMaturityFrac = this.getAge() / this.getGrowthCycleMaturityLength();
        if (curMaturityFrac > 1) {
            if (this.nitrogen > this.growthNitrogen && this.phosphorus > this.growthPhosphorus && this.lightlevel > this.getGrowthLightLevel()) {
                this.spawnSeed();
            }
            return;
        }
        let expectedNitrogen = curMaturityFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = curMaturityFrac ** 2 * this.growthPhosphorus;
        let expectedLightLevel = curMaturityFrac ** 2 * this.getGrowthLightLevel();
        let expectedNumRoots = curMaturityFrac * this.growthNumRoots;

        if (this.lightlevel > (expectedLightLevel * 1.1) && curMaturityFrac > 0.25) {
            this.lifeSquares.forEach((lsq) => lsq.lightHealth *= 0.9);
            this.growthLightLevel = expectedLightLevel;
            this.lightDamageCount += 1;
            if (this.lightDamageCount > 10) {
                this.stage = STAGE_DEAD;
            }
        }

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
        if ((this.curNumRoots < expectedNumRoots) && (this.nitrogen < expectedNitrogen || this.phosphorus < expectedPhosphorus)) {
            this.growRoot(scoreFunc);
        }
        if (this.lightlevel < expectedLightLevel) {
            this.executeGrowthPlans();
        }
    }

    // ** PLAN GROWTH METHOD IMPLEMENTED BY ORGANISMS 
    // for green growth, roots are handled generically (for now)
    planGrowth() {
        if (this.stage == STAGE_SPROUT) {
            this.addSproutGrowthPlan();
        }
    }


    // RENDERING
    render() {
        this.setNutrientIndicators();
        this.lifeSquares.forEach((sp) => sp.render())
    }

    setNutrientIndicators() {
        return;
        let maturityLifeFrac = Math.min(1, this.getAge() / this.getGrowthCycleMaturityLength());
        let expectedNitrogen = maturityLifeFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = maturityLifeFrac ** 2 * this.growthPhosphorus;
        let expectedLightLevel = maturityLifeFrac ** 2 * this.getGrowthLightLevel();

        let nitrogenMult = Math.min(2, this.nitrogen / expectedNitrogen);
        let phosphorusMult = Math.min(2, this.phosphorus / expectedPhosphorus);
        let lightLevelMult = Math.min(2, this.lightlevel / expectedLightLevel);

        this.lifeSquares.forEach((sq) => {
            sq.nitrogenIndicated = 0;
            sq.lightlevelIndicated = 0;
            sq.phosphorusIndicated = 0;
        });

        for (let i = 0; i < this.lifeSquares.length * 2; i++) {
            let sq = this.lifeSquares[i % this.lifeSquares.length];

            let nitrogenToAdd = Math.min(nitrogenMult, 0.5);
            let phosphorusToAdd = Math.min(phosphorusMult, 0.5)
            let lightLevelToAdd = Math.min(lightLevelMult, 0.5)

            sq.nitrogenIndicated = (sq.nitrogenIndicated + nitrogenToAdd) % 1;
            sq.lightlevelIndicated = (sq.lightlevelIndicated + phosphorusToAdd) % 1;
            sq.phosphorusIndicated = (sq.phosphorusIndicated + lightLevelToAdd) % 1;

            nitrogenMult -= nitrogenToAdd;
            phosphorusMult -= phosphorusToAdd;
            lightLevelMult -= lightLevelToAdd;
        }
    }



    doDecay() {
        if (this.stage != STAGE_DEAD) {
            return;
        }
        this.deathProgress += (getDt()) * loadGD(UI_SIMULATION_GENS_PER_DAY);
        if (this.originGrowth == null || this.deathProgress >= 1) {
            this.destroy();
        }
    }

    // DESTRUCTION
    destroy() {
        this.lifeSquares.forEach((lifeSquare) => lifeSquare.destroy());
        if (this.linkedSquare != null && this.linkedSquare != -1) {
            this.linkedSquare.unlinkOrganism();
        }
        removeOrganism(this);
    }

    doGodModePlantGrowth() {
        if (loadGD(UI_GODMODE_FASTPLANT)) {
            this.executeGrowthPlans();
            this.nitrogen += this.growthNitrogen / 40;
            this.phosphorus += this.growthPhosphorus / 40;
            this.lightlevel += this.growthLightLevel / 40;
        }
    }

    hasPlantLivedTooLong() {
        if (this.stage == STAGE_DEAD) {
            return;
        }
        let max = this.spawnTime + this.curLifeTimeOffset + this.getGrowthCycleLength() * this.numGrowthCycles;
        if (getCurDay() > max) {
            this.stage = STAGE_DEAD;
        }
    }

    // ** OUTER TICK METHOD INVOKED EACH FRAME
    // -- these methods are universal to every organism
    process() {
        this.waterPressureTick();
        this.nutrientTick();
        this.doPlantGrowth();
        this.doGodModePlantGrowth();
        this.planGrowth();
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
        this.hasPlantLivedTooLong();
        this.doDecay();
        this.lifeSquares = this.lifeSquares.sort((a, b) => a.distToFront - b.distToFront);

    }
}

export { BaseOrganism }