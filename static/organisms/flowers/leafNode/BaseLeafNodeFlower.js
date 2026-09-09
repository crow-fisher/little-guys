import { randNumber, randRange } from "../../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_GRASS, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_STEM, TYPE_GRASS, TYPE_STEM } from "../../Stages.js";
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
        this.maxStemLength = 5;
        this.maxLeafLength = 10;

        this.curNumGrass = 0;
        this.targetNumGrass = 1;
        this.targetGrassLength = 3;

        this.curNumStem = 0;
        this.targetNumStem = 0;

        this.targetStemLength = this.maxStemLength;
        this.targetLeafLength = this.maxLeafLength;;

        this.stems = [];
        this.leaves = [];
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

        this.maxNumStem = 1;
        this.maxStemLength = this.maxStemLength + Math.floor(this.maxStemLength * p0);

        this.growthNumGreen = this.maxStemLength * this.maxNumStem;
        this.growthNumRoots = this.growthNumGreen;
    }

    processLsqRendering() {
        if (!this.orgVisualUpdateFlag)
            return;
        this.stems.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                let l = stem.lifeSquares.length;
                let i = 0;
                stem.lifeSquares.forEach((lsq) => {
                    lsq.width = .3 + .3 * Math.log(3 + l - i);
                    i += 1;
                    this.applyColor(this.colorLeaf, i, lsq.renderColor);
                });
                stem.lifeSquares[0].theta = stem.lifeSquares[1]?.theta ?? stem.lifeSquares[0].theta;
            })


    this.leaves.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                let l = stem.lifeSquares.length;
                let i = 0;
                stem.lifeSquares.forEach((lsq) => {
                    lsq.width = .3 + .3 * Math.log(3 + l - i);
                    i += 1;
                    this.applyColor(this.colorLeaf, i, lsq.renderColor);
                });
                stem.lifeSquares[0].theta = stem.lifeSquares[1]?.theta ?? stem.lifeSquares[0].theta;
            })
    }

    prepareStemGrowthPlanParams() {
        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = 0;
        this.stemBaseCurve = 0;
        this.stemStrengthMult = .35;
        this.stemRollingAveragePeriod = 150;
    }

    growStem() {
        this.prepareStemGrowthPlanParams();
        let startRootNode = this.originGrowth.lifeSquares.at(0);

        if (this.curNumStem > 1)
            startRootNode = this.getRootOrigin();

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
                let startNode = stem.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_STEM);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != stem.growthPlan));
                    this.stems = Array.from(this.stems.filter((le) => this.originGrowth.getChildFromPath(le) != stem));
                    this.curNumStem -= 1;
                    return;
                }
                for (let i = 0; i < this.targetStemLength - stem.growthPlan.steps.length; i++) {
                    stem.growthPlan.steps.push(new GrowthPlanStep(
                        stem.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_STEM)
                    ))
                };
            });
    }

    lengthenLeaves() {
        this.leaves
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((leaf) => leaf.growthPlan.steps.length < this.targetLeafLength)
            .forEach((leaf) => {
                let startNode = leaf.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_LEAF);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != leaf.growthPlan));
                    this.leaves = Array.from(this.leaves.filter((le) => this.originGrowth.getChildFromPath(le) != leaf));
                    this.curNumStem -= 1;
                    return;
                }
                for (let i = 0; i < this.targetLeafLength - leaf.growthPlan.steps.length; i++) {
                    leaf.growthPlan.steps.push(new GrowthPlanStep(
                        leaf.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF)
                    ))
                };
            });
    }

    leafStems() {
        // adds 'leaves' to the stem at some interval
        this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                for (let i = 0; i < stem.lifeSquares.length; i++) {
                    let c = stem.lifeSquares[i];
                    if (c.leafNode == 1) {
                        continue;
                    }
                    c.leafNode = 1;
                    this.growLeafAtNode(c, (i & 1) ? 1 : -1); 
                }
            })
        
    }


    prepareLeafGrowthParams(side) {
        this.leafTwist = 0;
        this.leafBaseRotation = 0;
        this.leafBaseDeflection = 1;
        this.leafBaseCurve = .125;
        this.leafStrengthMult = .35;
        this.leafRollingAveragePeriod = 150;
    }

    growLeafAtNode(startNode, side) {
        this.prepareLeafGrowthParams(side);
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            side * Math.PI * Math.random(),
            this.leafTwist,
            this.leafBaseRotation, this.leafBaseDeflection, this.leafBaseCurve,
            TYPE_STEM, this.leafStrengthMult, this.leafRollingAveragePeriod);

        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.leaves.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF)
        ))

        this.growthPlans.push(growthPlan);
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }

        if (this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((stem) => stem.growthPlan.steps.length < this.targetStemLength)) {
            this.lengthenStem();
            return;
        }

        if (this.leafStems()) {
            return;
        }

        this.lengthenLeaves();

        if (this.curNumStem < this.targetNumStem) {
            this.growStem();
            return;
        }

        if (this.targetNumStem < this.maxNumStem) {
            this.targetNumStem += 1;
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