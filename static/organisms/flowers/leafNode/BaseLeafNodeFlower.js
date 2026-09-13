import { randNumber, randRange } from "../../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_FLOWER, SUBTYPE_FLOWERBUD, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_GRASS, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_STEM, TYPE_FLOWERNODE, TYPE_FLOWERPETAL, TYPE_GRASS, TYPE_STEM } from "../../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../../BaseOrganism.js";
import { UI_ORGANISM_FLOWER_LEAFNODE } from "../../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../../BaseOrganism.js";
import { LSQ_RENDERMODE_ELLIPSE } from "../../../lifeSquares/LifeSquareGreen.js";

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
        this.maxLeafLength = 5;

        this.curNumGrass = 0;
        this.targetNumGrass = 1;
        this.targetGrassLength = 3;

        this.curNumStem = 0;
        this.curNumFlower = 0;
        this.targetNumStem = 0;

        this.targetStemLength = this.maxStemLength;
        this.targetLeafLength = this.maxLeafLength;;

        this.maxFlowerLength = 3;
        this.targetFlowerLength = this.maxFlowerLength;

        this.numPetals = 24;
        this.petalAngleShift = 0; // randRange(0, 0.1 * Math.PI);

        this.stems = [];
        this.leaves = [];
        this.flowers = [];

        this.colorFlowerBack = [21, 26, 6];
        this.colorFlowerInner = [104, 89, 20];
        this.colorFlowerOuter = [145, 52, 12];
        this.colorFlowerPetal = [252, 195, 6];

        // rgb(168, 144, 58)
        // rgb(184, 100, 49)
        // rgb(252, 195, 6)

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

        this.flowers.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((flower) => {
                // let cMap = [this.colorFlowerOuter, this.colorFlowerInner];
                let cMap = [this.colorFlowerBack, this.colorFlowerOuter, this.colorFlowerInner];
                let sMap = [5,6,3];
                let i = 0;
                flower.lifeSquares.forEach((lsq) => {
                    // let v = Math.max(.3, Math.min(Math.cos(flower.getTheta()), 0.7));
                    let v = Math.cos(flower.getTheta());
                    // when at -1 or 1, we are viewing the flower from the side 
                    // we are looking at these flower pieces as a flat disc
                    
                    lsq.width = sMap[i];
                    this.applyColor(cMap[i], i, lsq.renderColor);
                    
                    lsq.renderMode = LSQ_RENDERMODE_ELLIPSE;
                    lsq.tx = v;
                    lsq.ty = 1;
                    lsq.distToFront -= 1;

                    i = (i + 1) % 3;
                    // lsq.width = Math.sin(lsq.component.getTheta());
                    // lsq.height = Math.sin(lsq.component.getTwist());
                });
                // let i = 0;
                // flower.children.forEach((child) => child.lifeSquares.forEach((lsq) => {
                //     this.applyColor((lsq.subtype == SUBTYPE_FLOWER ? this.colorFlowerInner : this.colorFlowerOuter), i, lsq.renderColor);
                //     i += 1;
                //     lsq.width = 0.5;
                // }));
            })

    }

    prepareStemGrowthPlanParams() {
        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = randRange(-.1, .1);
        this.stemBaseCurve = randRange(-.05, .05);
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

        let side = 1;
        this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                for (let i = 0; i < stem.lifeSquares.length - 4; i += 1) {
                    let c = stem.lifeSquares[i];
                    if (c.leafNode == 1) {
                        continue;
                    }
                    c.leafNode = 1;
                    this.growLeafAtNode(stem, c, side);
                    side *= -1;
                }
            })

    }

    prepareLeafGrowthParams(side) {
        this.leafTwist = 0;
        this.leafBaseRotation = Math.PI / 2;
        this.leafBaseDeflection = Math.PI / 2;
        this.leafBaseCurve = 0;
        this.leafStrengthMult = .35;
        this.leafRollingAveragePeriod = 150;
    }

    growLeafAtNode(stem, startNode, side) {
        this.prepareLeafGrowthParams(side);
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            randRange(0, 12),
            this.leafTwist,
            this.leafBaseRotation, this.leafBaseDeflection, this.leafBaseCurve,
            TYPE_STEM, this.leafStrengthMult, this.leafRollingAveragePeriod);

        growthPlan.postConstruct = () => {
            stem.addChild(growthPlan.component);
            this.leaves.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF)
        ))

        this.growthPlans.push(growthPlan);
    }

    growFlower() {
        let stem = this.originGrowth.getChildFromPath(this.stems[this.curNumFlower]);
        let startNode = stem.lifeSquares.at(stem.lifeSquares.length - 1);
        let i = this.curNumFlower;

        this.prepareLeafGrowthParams();

        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_FLOWER,
            Math.PI * Math.random(),
            this.leafTwist,
            this.leafBaseRotation + stem.endTheta, 
            this.leafBaseDeflection,
             this.leafBaseCurve,
            TYPE_FLOWERNODE
            , 10 ** 8);

        growthPlan.postConstruct = () => {
            stem.addChild(growthPlan.component);
            this.flowers[i] = this.originGrowth.getChildPath(growthPlan.component);
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let ret = this.growGreenSquareAction(startNode, SUBTYPE_FLOWERBUD, 0.3);
                return ret;
            }
        ));
        this.growthPlans.push(growthPlan);
        this.curNumFlower += 1;
    }

    growFlowerPetals() {
        this.flowers.map((path) => this.originGrowth.getChildFromPath(path)).forEach((flowerNodeComponent) => {
            if (flowerNodeComponent.children.length >= this.numPetals) {
                this.lengthenFlowerPetals();
            } else {
                let startTheta = randRange(0, 2 * Math.PI);
                let startNode = flowerNodeComponent.lifeSquares.at(0);
                for (let i = 0; i < this.numPetals; i++) {
                    let petalGrowthPlan = new GrowthPlan(
                        startNode.posX, startNode.posY,
                        false, STAGE_FLOWER,
                        startTheta + (i * (2 * Math.PI) / this.numPetals),
                        startTheta + (i * (2 * Math.PI) / this.numPetals), Math.PI * randRange(0.1, 0.2) + this.petalAngleShift, 0,
                        0, TYPE_FLOWERPETAL, 10 ** 8);
                    petalGrowthPlan.postConstruct = () => {
                        flowerNodeComponent.addChild(petalGrowthPlan.component);
                        startNode.subtype = SUBTYPE_FLOWERNODE;
                    }
                    petalGrowthPlan.steps.push(new GrowthPlanStep(
                        petalGrowthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_FLOWER)
                    ));
                    this.growthPlans.push(petalGrowthPlan);
                };
            }
        })
    }

    lengthenFlower() {
        this.flowers.map((path) => this.originGrowth.getChildFromPath(path)).forEach((flower) => {
            if (flower.growthPlan.steps.length < this.targetFlowerLength) {
                flower.growthPlan.steps.push(new GrowthPlanStep(
                    flower.growthPlan,
                    () => this.growGreenSquareAction(flower.lifeSquares.at(flower.lifeSquares.length - 1), SUBTYPE_FLOWERTIP, 0.1)
                ));
            }
        }
        )
    };

    lengthenFlowerPetals() {
        this.flowers.map((path) => this.originGrowth.getChildFromPath(path)).forEach((flowerNodeComponent) =>
            flowerNodeComponent.children.forEach((child) => {
                if (child.growthPlan.steps.length < this.targetFlowerLength) {
                    child.growthPlan.steps.push(new GrowthPlanStep(
                        child.growthPlan,
                        () => this.growGreenSquareAction(child.lifeSquares.at(child.lifeSquares.length - 1), SUBTYPE_FLOWERTIP)
                    ));
                }
            })
        );
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
        if (this.curNumFlower < this.maxNumStem) {
            this.growFlower();
            return;
        }
        this.lengthenFlower();
        // this.growFlowerPetals();
        // this.lengthenFlowerPetals();
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