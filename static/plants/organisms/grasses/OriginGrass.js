import { copyVecValue, multiplyVectorByScalar } from "../../../climate/stars/matrix.js";
import { randNumber, randRange, rr } from "../../../common.js";
import { applyLightingFromSource } from "../../../lighting/lightingProcessing.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { loadGD, UI_ORGANISM_GRASS_HTAIL } from "../../../ui/UIData.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { BasePlant, _llt_target, _llt_min, _llt_max, _llt_throttlValMax, _seedReduction, _waterPressureSoilTarget, _waterPressureOverwaterThresh, _waterPressureWiltThresh, _lightDecayValue, _lightLevelDisplayExposureAdjustment, baseOrganism_dnm } from "../BasePlant.js";
import { BasePlantSeed } from "../BasePlantSeed.js";
import { GrowthPlan } from "../growthPlan/GrowthPlan.js";
import { GrowthPlanStep } from "../growthPlan/GrowthPlanStep.js";
import { STAGE_ADULT, SUBTYPE_STEM, TYPE_STEM } from "../Stages.js";

export let htail_dnm = structuredClone(baseOrganism_dnm);

htail_dnm[_llt_target] = 1.45;
htail_dnm[_llt_min] = 0.74;
htail_dnm[_llt_max] = 1.43;
htail_dnm[_llt_throttlValMax] = 5.27;
htail_dnm[_seedReduction] = 0.10;
htail_dnm[_waterPressureSoilTarget] = -4;
htail_dnm[_waterPressureOverwaterThresh] = 1;
htail_dnm[_waterPressureWiltThresh] = -1.5;
htail_dnm[_lightDecayValue] = 4.42;
htail_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class OriginGrass extends BasePlant {
    constructor(square, seedLifeSquare, evolutionParameters) {
        super(square, seedLifeSquare, evolutionParameters);
        this.proto = "OriginGrass";
        this.uiRef = UI_ORGANISM_GRASS_HTAIL;
        this.targetFernShoots = 1;
        this.maxNumGrass = 10;
        this.targetGrassLength = 1;
        this.maxShootLength = 5;
        this.fernShoots = [];
    }

    process() {
        super.process();
        this.doGreenGrowth();
    }

    getDefaultNutritionMap() {
        return htail_dnm;
    }

    spawnSeed() {
        if (this.originGrowth == null || (this.growthPlans.some((gp) => !gp.areStepsCompleted())) || this.targetGrassLength != this.maxShootLength)
            return;
        let comp = this.originGrowth.children.at(0);
        let lsq_sq = comp.lifeSquares.at(0).linkedOrganism.linkedSquare;
        let seedSquare = addSquare(new SeedSquare(lsq_sq.posX, lsq_sq.posY - 10));
        if (seedSquare) {
            seedSquare.speedX = Math.random() > 0.5 ? -1 : 1 * randNumber(1, 2);
            seedSquare.speedY = randRange(-1.5, 1);
            let orgAdded = new OriginGrassSeedOrganism(seedSquare, this.getNextGenetics());
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.greenLifeSquares.at(0), orgAdded.seedLifeSquare)
             }
            this.growthProgress -= this.seedReduction();
        }
    }

    doGreenGrowth() {
        super.doGreenGrowth();
        if (this.originGrowth != null) {
            this.fernShoots.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
                .forEach((grass) => {
                    grass.lifeSquares.forEach((lsq) => lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length));

                })
        }
    }

    growFernShoot() {
        let startNode = this.originGrowth.lifeSquares.at(0);
        let growthPlan = new GrowthPlan(
            false, STAGE_ADULT, TYPE_STEM,
            randRange(-.1, .1), .8, randRange(-.1, .1),
            randRange(-.1, .1), randRange(-.1, .1), randRange(-.1, .1), 1)
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.fernShoots.push(this.originGrowth.getChildPath(growthPlan.component));
            growthPlan.component.offset_base = [rr(2), rr(1) + 1.5, rr(2)]
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let node = this.growPlantSquare(startNode);
                node.subtype = SUBTYPE_STEM;
                return node;
            }
        ))
        this.growthPlans.push(growthPlan);
    }

    lengthenFernShoot() {
        this.fernShoots
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => {
                            let node = this.growPlantSquare();
                            node.subtype = SUBTYPE_STEM;
                            return node;
                        }
                    ));
                };
            });
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.fernShoots.length < this.targetFernShoots) {
            this.growFernShoot();
            return;
        }
        if (this.fernShoots
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenFernShoot();
            return;
        }

        if (this.targetGrassLength < this.maxShootLength) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetFernShoots < this.maxNumGrass) {
            this.targetFernShoots += 1;
            return;
        }

        if (this.growthProgress >= 1) {
            this.spawnSeed();
        } 

    }

    prepareRender() {
        this.fernShoots
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                let curColor = [85, 128, 109];
                multiplyVectorByScalar(curColor, this.lightLevelDisplayExposureAdjustment());
                let width = 0.4;
                grass.lifeSquares.forEach((lsq) => {
                    copyVecValue(curColor, lsq.color);
                    lsq.width = width;
                    width *= .97;
                });
            });
    }
}

export class OriginGrassSeedOrganism extends BasePlantSeed {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "OriginGrassSeedOrganism";
    }

    getSproutType() {
        return OriginGrass;
    }
    getSproutTypeProto() {
        return "OriginGrass";
    }
}