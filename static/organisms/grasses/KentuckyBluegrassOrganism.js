import { randNumber, randRange } from "../../common.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_target, BaseOrganism, baseOrganism_dnm } from "../BaseOrganism.js";
import { KentuckyBluegrassGreenSquare } from "../../lifeSquares/grasses/KentuckyBluegrassGreenSquare.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { UI_ORGANISM_GRASS_KBLUE } from "../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../BaseOrganism.js";

export let kblue_dnm = structuredClone(baseOrganism_dnm);
kblue_dnm[_llt_target] = 1.45;
kblue_dnm[_llt_min] = 0.74;
kblue_dnm[_llt_max] = 1.43;
kblue_dnm[_llt_throttlValMax] = 5.27;
kblue_dnm[_seedReduction] = 0.10;
kblue_dnm[_waterPressureSoilTarget] = -4;
kblue_dnm[_waterPressureOverwaterThresh] = 1;
kblue_dnm[_waterPressureWiltThresh] = -1.5;
kblue_dnm[_lightDecayValue] = 4.42;
kblue_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class KentuckyBluegrassOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "KentuckyBluegrassOrganism";
        this.uiRef = UI_ORGANISM_GRASS_KBLUE;
        this.greenType = KentuckyBluegrassGreenSquare;
        this.rootType = RootLifeSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;

        this.targetNumGrass = 1;
        this.maxNumGrass = 2;

        this.targetGrassLength = 1;
        this.maxGrassLength = 5;

        this.numGrowthCycles = 1; 
        this.growthCycleMaturityLength = 12 + 7 * (Math.random());
        this.growthCycleLength = this.growthCycleMaturityLength * 2.65;

        this.grasses = [];
    }

    getDefaultNutritionMap() {
        return kblue_dnm;
    }
    

    spawnSeed() {
        if (this.originGrowth == null || (this.growthPlans.some((gp) => !gp.areStepsCompleted())) || this.targetGrassLength != this.maxGrassLength) 
            return;
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 10));
        if (seedSquare) {
            seedSquare.speedX = Math.random() > 0.5 ? -1 : 1 * randNumber(1, 2);
            seedSquare.speedY = randRange(-1.5, 1);
            let orgAdded = new KentuckyBluegrassSeedOrganism(seedSquare, this.getNextGenetics());
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.greenLifeSquares.at(0), orgAdded.greenLifeSquares.at(0));
            }
        }
        this.nitrogen *= (1 - this.seedReduction());
        this.phosphorus *= (1 - this.seedReduction());
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel *= (1 + .7 * p0);

        this.maxNumGrass = 2;
        this.maxGrassLength = 5 + Math.floor(this.maxGrassLength * p0);
        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen;
    }

    doGreenGrowth() {
        super.doGreenGrowth();
        if (this.originGrowth != null) {
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                grass.lifeSquares.forEach((lsq) => lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length));

            })
        }
    }

    growGrass() {
        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let growthPlan = new GrowthPlan(
            false, STAGE_ADULT, TYPE_STEM, 
            0, 0, 0, 0, 0, 0, 1)
        
            growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
            
            growthPlan.component.xOffset = 3 * (Math.random() - 0.5);
            growthPlan.component.yOffset = randRange(-growthPlan.component.xOffset, 0) - 1;
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let node = this.growPlantSquare(startNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_STEM;
                return node;
            }
        ))
        this.growthPlans.push(growthPlan);
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                let startNode = grass.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_STEM);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != grass.growthPlan));
                    this.leaves = Array.from(this.leaves.filter((le) => this.originGrowth.getChildFromPath(le) != grass));
                    return;
                }
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_STEM)
                    ))
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

        if (this.curNumGreen > this.growthNumGreen * .9) {
            this.stage = STAGE_FLOWER;
        }
    }
}

export class KentuckyBluegrassSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "KentuckyBluegrassSeedOrganism";
    }

    getSproutType() {
        return KentuckyBluegrassOrganism;
    }
    getSproutTypeProto() {
        return "KentuckyBluegrassOrganism";
    }
}