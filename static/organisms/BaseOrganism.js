import { removeOrganism } from "./_orgOperations.js";
import { randNumber } from "../common.js";
import { getCurDay, getDt } from "../climate/time.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_DEAD, STAGE_JUVENILE, STAGE_SPROUT, STATE_DEAD, STATE_HEALTHY, STATE_THIRSTY, SUBTYPE_ROOTNODE, TYPE_HEART } from "./Stages.js";
import { addSquare, getNeighbors } from "../squares/_sqOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { PlantSquare } from "../squares/PlantSquare.js";
import { processLighting } from "../lighting/lightingProcessing.js";
import { loadUI } from "../ui/UIData.js";

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

        this.greenType = null;
        this.rootType = null;

        this.curWilt = 0;
        this.waterPressure = -2.5;
        this.waterPressureTarget = -3;
        this.waterPressureWiltThresh = -4;
        this.waterPressureDieThresh = -5;
        this.waterPressureOverwaterThresh = -1.5;
        
        this.perDayWaterLoss = 0.2;

        this.rootPower = 2;

        // nutrients normalized to "pounds per acre" per farming websites
        this.ph = 7;
        this.nitrogen = 0;
        this.phosphorus = 0;
        this.lightlevel = 0;

        this.growthNumGreen = 20;
        this.growthNumRoots = 30;
        this.growthNitrogen = 50;
        this.growthPhosphorus = 25;
        this.growthLightLevel = 0.8; // desire mostly full sun 
        this.growthCycleMaturityLength = 2;
        this.growthCycleLength = 24; // in days

        this.applyWind = false;
        this.springCoef = 4;
        this.startDeflectionAngle = 0;
        this.lastDeflectionStateRollingAverage = 0;
        this.lastDeflectionStateThetaRollingAveragePeriod = 1000;
        this.deflectionIdx = 0;
        this.deflectionStateTheta = 0;
        this.deflectionStateFunctions = [];
        this.rootOpacity = 0.02;
        this.lighting = square.lighting;
    }

    // WIND DEFLECTION 


    getDecayNitrogen() {
        return this.nitrogen / this._lifeSquaresCount;
    }

    getDecayPhosphorus() {
        return this.phosphorus / this._lifeSquaresCount;
    }

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

    waterSaturationAndPhTick() {
        let amountOfWaterTransferred = 0;
        let sumPh = 0;
        let maxRootAbsorptionRate = getDt() * this.perDayWaterLoss;
        
        this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .filter((lsq) => (this.rootPower + lsq.linkedSquare.getSoilWaterPressure()) > this.waterPressure)
            .forEach((lsq) => {
                var amountOfWater = 0;
                if (this.waterPressure + amountOfWaterTransferred < this.waterPressureTarget) {
                    amountOfWater = lsq.linkedSquare.suckWater(maxRootAbsorptionRate);
                } else {
                    amountOfWater = lsq.linkedSquare.suckWater(maxRootAbsorptionRate / 10);
                };
                amountOfWaterTransferred += amountOfWater;
                sumPh += amountOfWaterTransferred * lsq.linkedSquare.ph;
            });
        
        this.ph = (this.ph * this.waterPressure + sumPh) / (this.waterPressure + amountOfWaterTransferred)
        this.waterPressure += amountOfWaterTransferred;

        // todo: make this humidfy the air
        this.waterPressure -= getDt() * this.perDayWaterLoss;
        this.wilt();
    }

    nutrientTick() {
        let growthCycleFrac = getDt() / this.growthCycleMaturityLength;
        let targetPerRootNitrogen = this.growthNitrogen * growthCycleFrac / this.growthNumRoots;
        let targetPerRootPhosphorus = this.growthPhosphorus * growthCycleFrac / this.growthNumRoots;

        this.lifeSquares
            .filter((lsq) => lsq.type == "root")
            .filter((lsq) => lsq.linkedSquare != null && lsq.linkedSquare.proto == "SoilSquare")
            .forEach((lsq) => {
                this.nitrogen += lsq.linkedSquare.takeNitrogen(targetPerRootNitrogen, growthCycleFrac);
                this.phosphorus += lsq.linkedSquare.takePhosphorus(targetPerRootPhosphorus, growthCycleFrac);
            });

        var growthNumGreen = this.growthNumGreen;

        this.lightlevel += this.lifeSquares
            .filter((lsq) => lsq.type == "green")
            .map((lsq) => processLighting(lsq.lighting))
            .map((rgb) => (rgb.r + rgb.b) / (255 * 2))
            .map((lightlevel) => (lightlevel / growthNumGreen) * growthCycleFrac)
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
    }

    wilt() {
        if (this.lifeSquares.length == 0) {
            return;
        }
        var greenLifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq.type == "green"));
        if (greenLifeSquares.length == 0) {
            return;
        }
        if (this.waterPressure < this.waterPressureWiltThresh) {
            this.curWilt += 0.01;
            var lifeSquareToThirstify = greenLifeSquares.at(randNumber(0, greenLifeSquares.length - 1));
            if (lifeSquareToThirstify.state == STATE_HEALTHY) {
                lifeSquareToThirstify.state = STATE_THIRSTY;
            } else if (lifeSquareToThirstify.state == STATE_THIRSTY) {
                lifeSquareToThirstify.state = STATE_DEAD;
            }
        } else {
            this.curWilt -= 0.01;
            var lifeSquareToRevive = greenLifeSquares.at(randNumber(0, greenLifeSquares.length - 1));
            if (lifeSquareToRevive.state != STATE_DEAD) {
                lifeSquareToRevive.state = STATE_HEALTHY;
            }
        }

        if (this.waterPressure > this.waterPressureOverwaterThresh) {
            var lifeSquareToKill = greenLifeSquares.at(randNumber(0, greenLifeSquares.length - 1));
            lifeSquareToKill.state = STATE_DEAD;
        }

        this.curWilt = Math.max(0, this.curWilt);
        this.curWilt = Math.min(Math.PI / 2, this.curWilt);

        var totalDead = Array.from(greenLifeSquares.filter((lsq) => lsq.state == STATE_DEAD)).length;

        if (totalDead > greenLifeSquares.length * 0.5) {
            this.stage = STAGE_DEAD;
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
        var pred = (lsq) => lsq.lighting != null && lsq.lighting.length > 0;
        if (this.lifeSquares.some(pred)) {
            lifeSquare.lighting = this.lifeSquares.reverse().find(pred).lighting;
        }
    }
    removeAssociatedLifeSquare(lifeSquare) {
        this.lifeSquares = Array.from(this.lifeSquares.filter((lsq) => lsq != lifeSquare));
        lifeSquare.destroy();
    }

    // COMPONENT GROWTH
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
                newGreenSquare.lighting = parentSquare.lighting;
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
    addSproutGrowthPlan() {
        if (this.linkedSquare.currentPressureDirect > 0) {
            this.destroy();
            return;
        }
        var growthPlan = new GrowthPlan(this.posX, this.posY, 
            true, STAGE_JUVENILE, Math.PI / 2, 0, 0, 
            0, 0, TYPE_HEART, 10 ** 8);
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            0,
            () => {
                var rootSq = new this.rootType(this.linkedSquare, this);
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
        let requiredLightLevel = curLifeFrac * this.growthLightLevel * .35;

        if (this.nitrogen < requiredNitrogen || this.phosphorus < requiredPhosphorus || this.lightlevel < requiredLightLevel) {
            return;
        }
        var anyStepFound = false;
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

        if (!anyStepFound) {
        }
    }

    growRoot(f) {
        if (getCurDay() < this.rootLastGrown + (this.growthCycleMaturityLength / this.growthNumRoots)) {
            return;
        }
        this.rootLastGrown = getCurDay();

        var targetSquare = null;
        var targetSquareParent = null;
        this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => {
            getNeighbors(lsq.posX, lsq.posY)
                .filter((_sq) => _sq != null)
                .filter((_sq) => _sq.rootable)
                .filter((_sq) => !(_sq.linkedOrganismSquares.some((llsq => llsq.linkedOrganism == this))))
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

    doPlantGrowth() {
        if (!this.lifeSquares.some((lsq) => lsq.type == "green")) {
            this.executeGrowthPlans();
        }
        if (this.waterPressure < this.waterPressureWiltThresh) {
            return;
        }
        let curMaturityFrac = (getCurDay() - this.spawnTime) / this.growthCycleMaturityLength; 
        if (curMaturityFrac > 1) {
            if (this.nitrogen > this.growthNitrogen && this.phosphorus > this.growthPhosphorus && this.lightlevel > this.growthLightLevel) {
                // console.log("Would flower");
            }
            return;
        }
        let expectedNitrogen = curMaturityFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = curMaturityFrac ** 2 * this.growthPhosphorus;
        let expectedLightLevel = curMaturityFrac ** 2 * this.growthLightLevel;

        let scoreFunc = (sq) => {
            var sqScore = 0;
            if (this.waterPressure < this.waterPressureTarget) {
                sqScore += sq.getSoilWaterPressure() / this.waterPressure;
            }
            if (this.nitrogen < expectedNitrogen) {
                sqScore += sq.nitrogen / this.growthNitrogen;
            }
            if (this.phosphorus < expectedPhosphorus) {
                sqScore += sq.phosphorus / this.growthPhosphorus;
            }
        }
        if (this.waterPressure < this.waterPressureTarget || this.nitrogen < expectedNitrogen || this.phosphorus < expectedPhosphorus) {
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
        let maturityLifeFrac = Math.min(1, (getCurDay() - this.spawnTime) / this.growthCycleMaturityLength); 
        let expectedNitrogen = maturityLifeFrac ** 2 * this.growthNitrogen;
        let expectedPhosphorus = maturityLifeFrac ** 2 * this.growthPhosphorus;
        let expectedLightLevel = maturityLifeFrac ** 2 * this.growthLightLevel;

        let nitrogenMult = Math.min(2, this.nitrogen / expectedNitrogen);
        let phosphorusMult =  Math.min(2, this.phosphorus / expectedPhosphorus);
        let lightLevelMult =  Math.min(2, this.lightlevel / expectedLightLevel);

        this.lifeSquares.forEach((sq) => {
            sq.nitrogenIndicated = 0;
            sq.lightlevelIndicated = 0;
            sq.phosphorusIndicated = 0;
        });

        for (let i = 0; i < this.lifeSquares.length * 2; i++) {
            var sq = this.lifeSquares[i % this.lifeSquares.length];

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
        if (this._lifeSquaresCount == -1) {
            this._lifeSquaresCount = this.lifeSquares.length;
        }
        this.lifeSquares.filter((lsq) => lsq.type == "root").forEach((lsq) => lsq.doGroundDecay());
        this.originGrowth.decay(Math.PI);
        if (this.lifeSquares.length <= 2) {
            this.destroy();
        }
        if (this.originGrowth.baseDeflection > Math.PI * 1.5) {
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

    // ** OUTER TICK METHOD INVOKED EACH FRAME
    // -- these methods are universal to every organism
    process() {
        this.waterSaturationAndPhTick();
        this.nutrientTick();
        this.doPlantGrowth();
        this.planGrowth();
        this.updateDeflectionState();
        this.applyDeflectionStateToSquares();
        this.doDecay();
        this.lifeSquares = this.lifeSquares.sort((a, b) => a.distToFront - b.distToFront);

    }
}

export { BaseOrganism }