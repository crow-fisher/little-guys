import { randNumber, randRange } from "../../common.js";
import { GenericRootSquare } from "../../lifeSquares/GenericRootSquare.js";
import { STAGE_ADULT, SUBTYPE_FLOWER, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_TRUNK, SUBTYPE_FLOWERTIP } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh, BaseOrganism, baseOrganism_dnm } from "../BaseOrganism.js";
import { CattailGreenSquare } from "../../lifeSquares/grasses/CattailGreenSquare.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { UI_ORGANISM_GRASS_CATTAIL } from "../../ui/UIData.js";

export let cattail_dnm = structuredClone(baseOrganism_dnm);
cattail_dnm[_llt_min] = 0.49;
cattail_dnm[_llt_max] = 1.29;
cattail_dnm[_llt_throttlValMax] = 5.35;
cattail_dnm[_seedReduction] = 0.08;
cattail_dnm[_waterPressureSoilTarget] = -2.07;
cattail_dnm[_waterPressureOverwaterThresh] = 1.93;
cattail_dnm[_waterPressureWiltThresh] = -.17;
cattail_dnm[_lightDecayValue] = 1;


export class CattailOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "CattailOrganism";
        this.uiRef = UI_ORGANISM_GRASS_CATTAIL;
        this.greenType = CattailGreenSquare;
        this.rootType = GenericRootSquare;
        this.grassGrowTimeInDays = 0.01;

        this.targetNumGrass = 1;
        this.maxNumGrass = 3;

        this.targetGrassLength = 3;
        this.maxGrassLength = 6;

        this.numGrowthCycles = 1; 
        this.growthCycleMaturityLength = 7 + 7 * (Math.random());
        this.growthCycleLength = this.growthCycleMaturityLength * 2.65;

        this.grasses = [];
    }
    getDefaultNutritionMap() {
        return cattail_dnm;
    }

    spawnSeed() {
        if (this.originGrowth == null || (this.growthPlans.some((gp) => !gp.areStepsCompleted())) || this.targetGrassLength != this.maxGrassLength) 
            return;
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 4));
        if (seedSquare) {
            seedSquare.speedY = -Math.round(randRange(-2, -5));
            seedSquare.speedX = Math.round(randRange(-5, 5));
            let orgAdded = new CattailSeedOrganism(seedSquare, this.getNextGenetics());
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.lifeSquares.at(0), orgAdded.lifeSquares.at(0));
            }
        }
        this.nitrogen *= (1 - this.seedReduction());
        this.phosphorus *= (1 - this.seedReduction());
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = 1 + .7 * p0;
        this.maxNumGrass = randNumber(1, 2);
        this.maxGrassLength = 10 + Math.floor(this.maxGrassLength * p0);
        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen / 4;
    }

    doGreenGrowth() {
        super.doGreenGrowth();
        if (this.originGrowth != null) {
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                grass.lifeSquares.forEach((lsq) => {
                    if (lsq.subtype == SUBTYPE_STEM) {
                        lsq.width = .2 + .3 * Math.log(1 + grass.lifeSquares.length);
                    } else {
                        if (lsq.subtype == SUBTYPE_FLOWERTIP) {
                            lsq.width = .2 + .25 * Math.log(1 + grass.lifeSquares.length);
                        } else {
                            lsq.width = .2 + .4 * Math.log(1 + grass.lifeSquares.length);
                        }
                    }
                });
            });

            if (this.grasses.length >= 2) {
                let grass = this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath)).at(1);
                let glsq = grass.lifeSquares;
                if (glsq.length < 9) {
                    return;
                }
                let min = glsq.length - 3;
                let max = glsq.length - 1;
                for (let i = 0; i < glsq.length; i++) {
                    if (i < min)
                        glsq[i].subtype = SUBTYPE_STEM;
                    else if (i < max)
                        glsq[i].subtype = SUBTYPE_FLOWER;
                    else 
                        glsq[i].subtype = SUBTYPE_FLOWERTIP;
                }
            }
        }
    }

    growGrass() {
        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let baseDeflection = randRange(0, .2);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.25), TYPE_TRUNK, .08);
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
            growthPlan.component.xOffset = 3 * (Math.random() - 0.5);
            growthPlan.component.yOffset = randRange(-growthPlan.component.xOffset, 0) - 1;
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startRootNode, SUBTYPE_STEM)
        ));
        this.growthPlans.push(growthPlan);
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                let startNode = grass.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_STEM);
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_STEM)
                    ));
                };
            });
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.originGrowth == null) {
            return;
        }
        if (this.grasses.length < this.targetNumGrass) {
            this.growGrass();
            return;
        }

        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.targetNumGrass < this.maxNumGrass) {
            this.targetNumGrass += 1;
            return;
        }
        if (this.targetGrassLength < this.maxGrassLength) {
            this.targetGrassLength += 1;
            return;
        }
    }
}

export class CattailSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "CattailSeedOrganism";
    }

    getSproutType() {
        return CattailOrganism;
    }
    getSproutTypeProto() {
        return "CattailOrganism";
    }
}