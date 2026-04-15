import { copyVecValue, multiplyVectorByScalar } from "../../../climate/stars/matrix.js";
import { randNumber, randRange, rr } from "../../../common.js";
import { applyLightingFromSource } from "../../../lighting/lightingProcessing.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { loadGD, UI_ORGANISM_GRASS_GRASS } from "../../../ui/UIData.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { BasePlant, _llt_target, _llt_min, _llt_max, _llt_throttlValMax, _seedReduction, _waterPressureSoilTarget, _waterPressureOverwaterThresh, _waterPressureWiltThresh, _lightDecayValue, _lightLevelDisplayExposureAdjustment, baseOrganism_dnm } from "../BasePlant.js";
import { BasePlantSeed } from "../BasePlantSeed.js";
import { GrowthPlan } from "../growthPlan/GrowthPlan.js";
import { GrowthPlanStep } from "../growthPlan/GrowthPlanStep.js";
import { STAGE_ADULT, SUBTYPE_STEM, TYPE_STEM } from "../Stages.js";

export let grass_dnm = structuredClone(baseOrganism_dnm);

grass_dnm[_llt_target] = 1.45;
grass_dnm[_llt_min] = 0.74;
grass_dnm[_llt_max] = 1.43;
grass_dnm[_llt_throttlValMax] = 5.27;
grass_dnm[_seedReduction] = 0.10;
grass_dnm[_waterPressureSoilTarget] = -4;
grass_dnm[_waterPressureOverwaterThresh] = 1;
grass_dnm[_waterPressureWiltThresh] = -1.5;
grass_dnm[_lightDecayValue] = 4.42;
grass_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class OriginGrass extends BasePlant {
    constructor(square, seedLifeSquare, evolutionParameters) {
        super(square, seedLifeSquare, evolutionParameters);
        this.proto = "OriginGrass";
        this.uiRef = UI_ORGANISM_GRASS_GRASS;
        this.targetGrasses = 1;
        this.maxNumGrass = 1;
        this.targetGrassLength = 1;
        this.maxShootLength = 5;
        this.grasses = [];
    }

    process() {
        super.process();
        this.doGreenGrowth();
    }

    getDefaultNutritionMap() {
        return grass_dnm;
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
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
                .forEach((grass) => {
                    grass.lifeSquares.forEach((lsq) => lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length));

                })
        }
    }

    growGrass() {
        let startNode = this.originGrowth.lifeSquares.at(0);
        let growthPlan = new GrowthPlan(
            false, STAGE_ADULT, TYPE_STEM,
            randRange(-.1, .1), .8, randRange(-.1, .1),
            randRange(-.1, .1), randRange(-.1, .1), randRange(-.1, .1), 1)
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component));
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

    lengthenGrass() {
        this.grasses
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
        if (this.grasses.length < this.targetGrasses) {
            this.growGrass();
            return;
        }
        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.targetGrassLength < this.maxShootLength) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetGrasses < this.maxNumGrass) {
            this.targetGrasses += 1;
            return;
        }

        if (this.growthProgress >= 1) {
            this.spawnSeed();
        } 

    }

    prepareRender() {
        this.grasses
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