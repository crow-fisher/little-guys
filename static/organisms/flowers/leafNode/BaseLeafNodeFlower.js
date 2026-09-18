import { hsvToRgb, invlerp, randNumber, randRange } from "../../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_FLOWER, SUBTYPE_FLOWERBUD, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_GRASS, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_STEM, TYPE_FLOWERNODE, TYPE_FLOWERPETAL, TYPE_GRASS, TYPE_STEM } from "../../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../../BaseOrganism.js";
import { UI_ORGANISM_FLOWER_LEAFNODE } from "../../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../../BaseOrganism.js";
import { LSQ_RENDERMODE_ELLIPSE, LSQ_RENDERMODE_THETA, LSQ_RENDERMODE_THETA_SLOPE } from "../../../lifeSquares/LifeSquareGreen.js";

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
        this.maxStemLength = 14;
        this.maxLeafLength = 4;

        this.curNumGrass = 0;
        this.targetNumGrass = 1;
        this.targetGrassLength = 3;

        this.curNumStem = 0;
        this.curNumFlower = 0;
        this.targetNumStem = 0;

        this.targetStemLength = this.maxStemLength;
        this.targetLeafLength = this.maxLeafLength;

        this.maxFlowerLength = 5;
        this.targetFlowerLength = this.maxFlowerLength;

        this.numPetals = 25;
        this.petalAngleShift = 0; // randRange(0, 0.1 * Math.PI);

        this.stems = [];
        this.leaves = [];
        this.flowers = [];

        this.baseColorFlowerDarkGreen = [21, 26, 6];

        this.colorLeaf = [56, 63, 19];
        this.colorStem = [46, 53, 16];

        // rgb(56, 63, 19);
        // rgb(46, 53, 16);

        this.flowerColorC =  [25, 24, 24];
        this.flowerColorR1 = [44, 14, 15];
        this.flowerColorR2 = [224, 160, 45];
        this.flowerColorR3 = [233, 201, 57];

        // rgb(25, 24,   24)
        // rgb(44, 14,   15)
        // rgb(224, 160, 45)
        // rgb(233, 201, 57)

        this.flowerR1D = -0.1;
        this.flowerR2D = -0.0;
        this.flowerR3D = 0.2;
        this.flowerR4D = 0.4;

        this.flowerR1W = 0.1;
        this.flowerR2W = 0.7;
        this.flowerR3W = 1;
        this.flowerR4W = 1;
        this.flowerR5W = 1;

        this.flowerColor = [
            this.flowerColorC,
            this.flowerColorR1,
            this.flowerColorR2,
            this.flowerColorR3
        ]

        this.flowerD = [
            this.flowerR1D,
            this.flowerR2D,
            this.flowerR3D,
            this.flowerR4D
        ]

        this.flowerW = [
            this.flowerR1W,
            this.flowerR2W,
            this.flowerR3W,
            this.flowerR4W,
            this.flowerR5W
        ]
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
        // if (!this.orgVisualUpdateFlag)
        // return;
        this.stems.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                let l = stem.lifeSquares.length;
                let i = 0;
                stem.lifeSquares.forEach((lsq) => {
                    lsq.width = .1 + .2 * Math.log(3 + l - i);
                    i += 1;
                    this.applyColor(this.colorStem, i, lsq.renderColor);
                });
                stem.lifeSquares[0].theta = stem.lifeSquares[1]?.theta ?? stem.lifeSquares[0].theta;
            })

        let sMap = [0.8, 1.2, 0.9, 0.2]
        let j = 0;
        this.leaves.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((leaf) => {
                let l = leaf.lifeSquares.length;
                let i = 0;
                leaf.lifeSquares.forEach((lsq) => {
                    // lsq.width = .3 + .3 * Math.log(3 + l - i);
                    lsq.width = sMap[i];
                    lsq.w1 = sMap[i];
                    lsq.w2 = sMap[i + 1];
                    lsq.height = 0.7;
                    lsq.renderMode = LSQ_RENDERMODE_THETA_SLOPE;
                    i += 1;
                    j += 1;
                    this.applyColor(this.colorLeaf, j, lsq.renderColor, true, .8, 2);
                });
                leaf.lifeSquares[0].theta = leaf.lifeSquares[1]?.theta ?? leaf.lifeSquares[0].theta;
            })


        this.flowers.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((flower) => {
                flower.lifeSquares.forEach((lsq) => lsq.opacity = 0);
                let i = 0;
                // rgb(25, 24, 24)
                // rgb(36, 21, 15)
                // rgb(117, 111, 23)
                // rgb(167, 143, 41)

                this.baseColorFlowerDarkGreen = [21, 26, 6];
                this.flowerColorC =  [25, 24, 24];
                this.flowerColorR1 = [36, 21, 15];
                this.flowerColorR2 = [117, 111, 23];
                this.flowerColorR3 = [167, 143, 41];

                this.flowerR1D = 0.3;
                this.flowerR2D = .7;
                this.flowerR3D = .8;
                this.flowerR4D = 1;

                this.flowerR1W = 0.9;
                this.flowerR2W = 0.9;
                this.flowerR3W = 0.9;
                this.flowerR4W = 0.5;
                this.flowerR5W = 0.1;

                this.flowerR1H = 0.30;
                this.flowerR2H = 0.70;
                this.flowerR3H = 0.70;
                this.flowerR4H = 0.90;

                this.flowerColor = [
                    this.flowerColorC,
                    this.flowerColorR1,
                    this.flowerColorR2,
                    this.flowerColorR3
                ]

                this.flowerD = [
                    this.flowerR1D,
                    this.flowerR2D,
                    this.flowerR3D,
                    this.flowerR4D,
                ]

                this.flowerW = [
                    this.flowerR1W,
                    this.flowerR2W,
                    this.flowerR3W,
                    this.flowerR4W,
                    this.flowerR5W
                ]

                this.flowerH = [
                    this.flowerR1H,
                    this.flowerR2H,
                    this.flowerR3H,
                    this.flowerR4H,
                ]
                flower.parentComponent.lifeSquares.slice(flower.parentComponent.lifeSquares.length - 2).forEach((lsq) => this.applyColor(this.baseColorFlowerDarkGreen, 0, lsq.renderColor));

                let j = 0;
                flower.children.forEach((child) => child.lifeSquares.forEach((lsq) => {
                    let p = 1 - invlerp(child.posY - this.maxFlowerLength, child.posY, lsq.posY);
                    let i = 0;
                    while (p > this.flowerD[i]) {
                        i += 1;
                    }
                    let col = this.flowerColor[i];
                    lsq.w1 = this.flowerW[i];
                    lsq.w2 = this.flowerW[i + 1];
                    lsq.height = this.flowerH[i];

                    lsq.renderMode = LSQ_RENDERMODE_THETA_SLOPE;
                    this.applyColor(col, j, lsq.renderColor);
                    j += 1;
                }));

            })

    }

    prepareStemGrowthPlanParams() {
        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = randRange(-.1, .1);
        this.stemBaseCurve = randRange(-.05, .05);
        this.stemStrengthMult = .35;
        this.stemRollingAveragePeriod = 150;

        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = 0;
        this.stemBaseCurve = -.2
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
                let startNode = leaf.lifeSquares.at(leaf.lifeSquares.length - 1)
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
        this.leafTwist = 0; //= Math.PI / 2 + .1;
        this.leafBaseRotation = 0; //= Math.PI / 2;
        this.leafBaseDeflection = 0; //= Math.PI / 2;
        this.leafBaseCurve = 0; //= 1;

        this.leafTwist = Math.PI / 2 + randRange(0.3, 0.7);
        this.leafBaseRotation = Math.PI / 2;
        this.leafBaseDeflection = 0
        this.leafBaseCurve = .7;

        this.leafStrengthMult = .35;
        this.leafRollingAveragePeriod = 150;
    }

    growLeafAtNode(stem, startNode, side) {
        this.prepareLeafGrowthParams(side);
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            randRange(0, Math.PI * 2),
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
            0,
            0,
            Math.PI / 2,
            0,
            0,
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
                    let a = startTheta + (i * (2 * Math.PI) / this.numPetals) + randRange(-.03, .03);
                    let petalGrowthPlan = new GrowthPlan(
                        startNode.posX, startNode.posY,
                        false, STAGE_FLOWER,
                        a,
                        a,
                        0,
                        0,
                        0,
                        TYPE_FLOWERPETAL, 10 ** 8);
                    petalGrowthPlan.postConstruct = () => {
                        flowerNodeComponent.addChild(petalGrowthPlan.component);
                        startNode.subtype = SUBTYPE_FLOWERNODE;
                    }
                    petalGrowthPlan.steps.push(new GrowthPlanStep(
                        petalGrowthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_FLOWER), 4
                    ));
                    this.growthPlans.push(petalGrowthPlan);
                };
            }
        })
    }

    lengthenFlower() {
        this.flowers.map((path) => this.originGrowth.getChildFromPath(path)).forEach((flower) => {
            if (flower.growthPlan.steps.length < 2) {
                flower.growthPlan.steps.push(new GrowthPlanStep(
                    flower.growthPlan,
                    () => this.growGreenSquareAction(flower.lifeSquares.at(flower.lifeSquares.length - 1), SUBTYPE_FLOWERTIP, 0.3)
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
        this.growFlowerPetals();
        // this.lengthenFlowerPetals();
    }
}

export class BaseLeafNodeFlowerSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, parentId) {
        super(square, evolutionParameters, parentId);
        this.proto = "BaseLeafNodeFlowerSeedOrganism";
    }

    getSproutType() {
        return BaseLeafNodeFlower;
    }
    getSproutTypeProto() {
        return "BaseLeafNodeFlower";
    }
}