import { randNumber, randRange } from "../../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_GRASS, SUBTYPE_NODE, SUBTYPE_STEM, TYPE_GRASS, TYPE_STEM } from "../../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../../BaseOrganism.js";
import { UI_ORGANISM_FLOWER_LEAFNODE } from "../../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../../BaseOrganism.js";

export let leafNodeFlower_dnm = structuredClone(baseOrganism_dnm);
leafNodeFlower_dnm[_llt_mult] = 1.45;
leafNodeFlower_dnm[_llt_min] = 0.74;
leafNodeFlower_dnm[_llt_max] = 1.43;
leafNodeFlower_dnm[_llt_throttlValMax] = 5.27;
leafNodeFlower_dnm[_seedReduction] = 0.10;
leafNodeFlower_dnm[_waterPressureSoilTarget] = -4;
leafNodeFlower_dnm[_waterPressureOverwaterThresh] = 1;
leafNodeFlower_dnm[_waterPressureWiltThresh] = -1.5;
leafNodeFlower_dnm[_lightDecayValue] = 4.42;
leafNodeFlower_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class BaseLeafNodeFlower extends BaseOrganism {
    constructor(square, parentId) {
        super(square, parentId);
        this.proto = "BaseLeafNodeFlower";
        this.uiRef = UI_ORGANISM_FLOWER_LEAFNODE;


        this.maxNumStem = 1;
        this.maxStemLength = 12;

        this.maxNumGrass = 2;
        this.maxGrassLength = 5;

        this.curNumGrass = 0;
        this.targetNumGrass = 1;
        this.targetGrassLength = 3;

        this.curNumStem = 0;
        this.targetNumStem = 0;
        this.targetStemLength = 0;

        this.stems = [];
        this.grasses = [];
    }


    getSeedType() {
        return BaseLeafNodeFlowerSeedOrganism;
    }

    getDefaultNutritionMap() {
        return leafNodeFlower_dnm;
    }

    processGenetics() {
        super.processGenetics();
        let p0 = this.evolutionParameters[0];
        this.maxNumGrass = randNumber(3, 5);
        this.maxGrassLength = this.maxGrassLength + Math.floor(this.maxGrassLength * p0);

        this.maxNumStem = 1;
        this.maxStemLength = 12;

        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen;
    }

    processLsqRendering() {
        if (!this.orgVisualUpdateFlag)
            return;
        this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                let l = grass.lifeSquares.length;
                let i = 0;
                grass.lifeSquares.forEach((lsq) => {
                    lsq.width = .3 + .3 * Math.log(3 + l - i);
                    i += 1;
                    this.applyColor(this.colorLeaf, i, lsq.renderColor);
                });
                grass.lifeSquares[0].theta = grass.lifeSquares[1]?.theta ?? grass.lifeSquares[0].theta;
            })
    }

    prepareGrassGrowthPlanParams() {
        this.grassTwist = randRange(.01, .3);
        this.grassBaseRotation = 0;
        this.grassBaseDeflection = randRange(.01, .3);;
        this.grassBaseCurve = 0;
        this.grassStrengthMult = .15;
        this.grassRollingAveragePeriod = 150;
    }

    growGrass() {
        if (this.curNumGrass > (this.curNumRoots / 4)) {
            return;
        }
        this.prepareGrassGrowthPlanParams();
        let startRootNode = this.getRootOrigin()
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY,
            false, STAGE_ADULT,
            randRange(-Math.PI, Math.PI),
            this.grassTwist,
            this.grassBaseRotation, this.grassBaseDeflection, this.grassBaseCurve,
            TYPE_GRASS, this.grassStrengthMult, this.grassRollingAveragePeriod);

        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startRootNode, SUBTYPE_GRASS)
        ))
        this.growthPlans.push(growthPlan);
        this.curNumGrass += 1;
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                let startNode = grass.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_GRASS);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != grass.growthPlan));
                    this.grasses = Array.from(this.grasses.filter((le) => this.originGrowth.getChildFromPath(le) != grass));
                    this.curNumGrass -= 1;
                    return;
                }
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_GRASS)
                    ))
                };
            });
    }

    prepareStemGrowthPlanParams() {
        this.stemTwist = randRange(.01, .1);
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = randRange(.01, .03);;
        this.stemBaseCurve = 0;
        this.stemStrengthMult = .35;
        this.stemRollingAveragePeriod = 150;
    }

    growStem() {
        if (this.curNumStem > (this.curNumRoots / 4)) {
            return;
        }
        this.prepareStemGrowthPlanParams();
        let startRootNode = this.getRootOrigin()
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY,
            false, STAGE_ADULT,
            randRange(-Math.PI, Math.PI),
            this.stemTwist,
            this.stemBaseRotation, this.stemBaseDeflection, this.stemBaseCurve,
            TYPE_STEM, this.stemStrengthMult, this.stemRollingAveragePeriod);

        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.stems.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startRootNode, SUBTYPE_STEM)
        ))
        this.growthPlans.push(growthPlan);
        this.curNumStem += 1;
    }

    lengthenStem() {
        this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((stem) => stem.growthPlan.steps.length < this.targetStemLength)
            .forEach((stem) => {
                let startNode = stem.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_GRASS);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != stem.growthPlan));
                    this.stems = Array.from(this.stems.filter((le) => this.originGrowth.getChildFromPath(le) != stem));
                    this.curNumStem -= 1;
                    return;
                }
                for (let i = 0; i < this.targetStemLength - stem.growthPlan.steps.length; i++) {
                    stem.growthPlan.steps.push(new GrowthPlanStep(
                        stem.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_GRASS)
                    ))
                };
            });
    }


    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }

        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((stem) => stem.growthPlan.steps.length < this.targetStemLength)) {
            this.lengthenStem();
            return;
        }

        if (this.targetGrassLength < (this.maxGrassLength / 2)) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetNumStem < this.maxNumStem) {
            this.targetNumStem += 1;
            return;
        }

        if (this.targetNumGrass < this.maxNumGrass) {
            this.targetNumGrass += 1;
            return;
        }

        if (this.curNumGrass < this.targetNumGrass) {
            this.growGrass();
            return;
        }

        if (this.curNumStem < this.targetNumStem) {
            this.growStem();
            return;
        }

        if (this.targetGrassLength < this.maxGrassLength) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetStemLength < this.maxStemLength) {
            this.targetStemLength += 1;
            return;
        }
    }
}

export class BaseLeafNodeFlowerSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, parentId) {
        super(square, evolutionParameters, parentId);
        this.proto = "BaseGrassSeedOrganism";
    }

    getSproutType() {
        return BaseLeafNodeFlower;
    }
    getSproutTypeProto() {
        return "BaseLeafNodeFlower";
    }
}