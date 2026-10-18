import { dec2bin, hsvToRgb, invlerp, randNumber, randRange } from "../../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_FLOWER, SUBTYPE_FLOWERBUD, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_GRASS, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_STEM, TYPE_FLOWERNODE, TYPE_FLOWERPETAL, TYPE_GRASS, TYPE_LEAF, TYPE_LEAFSTEM, TYPE_STEM } from "../../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep, ThetaMin, ThetaMax, TwistMin, TwistMax, RotationMin, RotationMax, DeflectionMin, DeflectionMax, CurveMin, CurveMax, StrengthMin, StrengthMax, PeriodMin, PeriodMax } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../../BaseOrganism.js";
import { UI_ORGANISM_FLOWER_LEAFNODE } from "../../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../../BaseOrganism.js";
import { LSQ_RENDERMODE_ELLIPSE, LSQ_RENDERMODE_THETA, LSQ_RENDERMODE_THETA_SLOPE } from "../../../lifeSquares/LifeSquareGreen.js";
import { OrganismGeneticCode } from "../../genetics/OrganismGeneticCode.js";
import { SKSA_THETA, SKSA_TWIST, SKSA_DEFLECTION, SKSA_CURVE, SKSA_STRENGTH, SKSA_PERIOD, SKSM_STEM, SKSO_LEAFNODE, SKSM_LEAF, SKSM_LEAFSTEM, SKSA_ROTATION, SKSC_FLOWER } from "../../genetics/enum/namespace/vanilla/keySpecifiers.js";
import { SKF_ATTRIBUTE, SKF_COLOR, SKF_MEMBER, SKF_ORIGIN } from "../../genetics/enum/namespace/vanilla/keyFlags.js";
import { compositeSoupKey } from "../../genetics/enum/soupEnum.js";
import { addVec3MultDest, addVectorsCopy, addVectorsCopyPost } from "../../../util/vector.js";

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
    constructor(square, genetics, parentId) {
        super(square, genetics, parentId);
        this.proto = "BaseLeafNodeFlower";
        this.uiRef = UI_ORGANISM_FLOWER_LEAFNODE;
        this.maxNumStem = 1;
        this.maxStemLength = 14;
        this.maxLeafStemLength = 3;
        this.maxLeafLength = 4;

        this.stemLsqHeight = 1;
        this.leafStemLsqHeight = 1;
        this.leafLsqHeight = 0.7;
        this.flowerLsqHeight = 0.7;
        this.leafStemDy = 0.7;
        this.leafDy = 1;

        this.curNumGrass = 0;
        this.targetNumGrass = 1;
        this.targetGrassLength = 3;

        this.curNumStem = 0;
        this.curNumFlower = 0;
        this.targetNumStem = 0;

        this.maxFlowerPetalLength = 8;

        this.numPetals = 100;

        this.stems = [];
        this.leaves = [];
        this.flowers = [];

        this.colorLeaf = [56, 63, 19];
        this.colorStem = [46, 53, 16];
        this.colorStemFlowerBase = [21, 26, 6];

        this.flowerColor = [];
        
        let cur = [0, 0, 0, 1];
        for (let i = 0; i < this.numPetals; i++) {
            this.flowerColor.push([addVectorsCopyPost(cur, [10, 10, 10, 0])]);
        }

        this.stemParams = {
            ThetaMin: -Math.PI,
            ThetaMax: Math.PI,
            TwistMin: 0.0,
            TwistMax: 0.0,
            RotationMin: 0.0,
            RotationMax: 0.0,
            DeflectionMin: 0.1,
            DeflectionMax: 0.2,
            CurveMin: -.05,
            CurveMax: .05,
            StrengthMin: 0.35,
            StrengthMax: 0.35,
            PeriodMin: 150.0,
            PeriodMax: 150.0
        }

        this.leafStemParams = {
            ThetaMin: -Math.PI,
            ThetaMax: Math.PI,
            TwistMin: 0.0,
            TwistMax: 0.0,
            RotationMin: 0.0,
            RotationMax: 0.0,
            DeflectionMin: 0.8,
            DeflectionMax: 1.2,
            CurveMin: 0.8,
            CurveMax: 1.2,
            StrengthMin: 0.35,
            StrengthMax: 0.35,
            PeriodMin: 150.0,
            PeriodMax: 150.0
        }

        this.leafParams = {
            ThetaMin: -Math.PI,
            ThetaMax: Math.PI,
            TwistMin: 1.5,
            TwistMax: 2.5,
            RotationMin: 1.5,
            RotationMax: 2.5,
            DeflectionMin: 0.8,
            DeflectionMax: 1.2,
            CurveMin: 0,
            CurveMax: 0,
            StrengthMin: 0.35,
            StrengthMax: 0.35,
            PeriodMin: 150.0,
            PeriodMax: 150.0
        }

    }

    getNextParams(map) {
        return [randRange(map[ThetaMin], map[ThetaMax]),
        randRange(map[TwistMin], map[TwistMax]),
        randRange(map[RotationMin], map[RotationMax]),
        randRange(map[DeflectionMin], map[DeflectionMax]),
        randRange(map[CurveMin], map[CurveMax]),
        randRange(map[StrengthMin], map[StrengthMax]),
        randRange(map[PeriodMin], map[PeriodMax])]
    }

    addMemberGroup(code, map, keySpecifier, index) {
        code.addTagIndex(SKF_MEMBER, keySpecifier, index);
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_THETA, 0, map[ThetaMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_THETA, 1, map[ThetaMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_TWIST, 0, map[TwistMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_TWIST, 1, map[TwistMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_ROTATION, 0, map[RotationMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_ROTATION, 1, map[RotationMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_DEFLECTION, 0, map[DeflectionMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_DEFLECTION, 1, map[DeflectionMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_CURVE, 0, map[CurveMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_CURVE, 1, map[CurveMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_STRENGTH, 0, map[StrengthMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_STRENGTH, 1, map[StrengthMax])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_PERIOD, 0, map[PeriodMin])
        code.addTagIndexValue(SKF_ATTRIBUTE, SKSA_PERIOD, 1, map[PeriodMax])
    }

    addColors(code, keySpecifier, arr) {
        code.addTag(SKF_COLOR, keySpecifier);
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                code.addRgbaValue(...arr[i][j]);
            }
        }
    }

    generateGeneticCode() {
        let code = new OrganismGeneticCode();
        code.addTag(SKF_ORIGIN, SKSO_LEAFNODE);
        this.addMemberGroup(code, this.stemParams, SKSM_STEM, 0);
        this.addMemberGroup(code, this.leafParams, SKSM_LEAF, 0);
        this.addMemberGroup(code, this.leafStemParams, SKSM_LEAFSTEM, 0);
        this.addColors(code, SKSC_FLOWER, this.flowerColor);
        return code;
    }

    parseGenetics() {
        let code = new OrganismGeneticCode(this.genetics)
        if (code.code.length == 0) {
            return;
        }

        let i = 0;

        let ot = code.code[i];
        let otks = ot & ~(compositeSoupKey(SKF_ORIGIN));
        let err = false;

        err |= (ot & compositeSoupKey(SKF_ORIGIN)) != compositeSoupKey(SKF_ORIGIN);
        err |= otks != SKSO_LEAFNODE;

        if (err) {
            console.warn("Unable to parse origin genetics with this implementation class:", this.proto, this.genetics)
            return;
        }

        i += 1;
        for (let j = 0; j < 3; j++) {
            ot = code.code[i];
            otks = ot & ~(compositeSoupKey(SKF_MEMBER));
            switch (otks) {
                case SKSM_STEM:
                    // parse for stem
                    i = this.parseMemberGroup(this.stemParams, code, i);
                    continue;
                case SKSM_LEAF:
                    i = this.parseMemberGroup(this.leafParams, code, i);
                    continue;
                case SKSM_LEAFSTEM:
                    i = this.parseMemberGroup(this.leafStemParams, code, i);
                    continue;
                default:
                    break;
            }
        }

        for (let j = 0; j < 1; j++) {
            ot = code.code[i];
            otks = ot & ~(compositeSoupKey(SKF_COLOR));
            switch (otks) {
                case SKSC_FLOWER:
                    i = this.parseColor(this.flowerColor, code, i)
                default:
                    break;
            }
        }
    }

    parseMemberGroup(map, code, i) {
        let j = 0;
        i += 1;
        for (; j < Object.keys(this.stemParams).length * 2; j += 2) {
            let key = code.code[i + j];
            let value = code.intValueToNumber(code.code[i + j + 1]);
            switch (key) {
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_THETA | 0):
                    map[ThetaMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_THETA | 1):
                    map[ThetaMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_TWIST | 0):
                    map[TwistMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_TWIST | 1):
                    map[TwistMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_ROTATION | 0):
                    map[RotationMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_ROTATION | 1):
                    map[RotationMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_DEFLECTION | 0):
                    map[DeflectionMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_DEFLECTION | 1):
                    map[DeflectionMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_CURVE | 0):
                    map[CurveMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_CURVE | 1):
                    map[CurveMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_STRENGTH | 0):
                    map[StrengthMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_STRENGTH | 1):
                    map[StrengthMax] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_PERIOD | 0):
                    map[PeriodMin] = value;
                    continue;
                case compositeSoupKey(SKF_ATTRIBUTE, SKSA_PERIOD | 1):
                    map[PeriodMax] = value;
                    continue;
                default:
                    console.log("Failed parse in parseMemberGroup, key ", key);
                    return 10 ** 8;
            }
        }
        return i + j;
    }

    parseColor(arr, code, _i) {
        for (let i = 0; i < this.maxFlowerPetalLength; i++) {
            for (let j = 0; j < this.numPetals; j++) {
                arr[i][j] = code.popRgbaValue(++_i);
            }
        }
        return _i;
    }

    getGeneticsGrowthPlanConfig() {
        return {
            "stem": this.stemParams,
            "leaf stem": this.leafStemParams,
            "leaf": this.leafParams
        }
    }

    getGeneticsColorConfig() {
        return {
            "flower": "flowerColor" // referencing "this.flowerColor"
        }

    }

    getSeedType() {
        return BaseLeafNodeFlowerSeedOrganism;
    }

    leafShapeFunc(x) {
        return Math.sin(Math.PI * x - 5) + 1.2 * x - .2;
    }

    flowerShapeFunc(x) {
        return Math.abs(Math.sin(Math.PI * 8 * x)) * .6
    }

    getDefaultNutritionMap() {
        return leafNodeFlower_dnm;
    }

    processGenetics() {
        super.processGenetics();

        this.targetStemLength = this.maxStemLength;
        this.targetLeafStemLength = this.maxLeafStemLength;
        this.targetLeafLength = this.maxLeafLength;
        this.targetFlowerLength = this.maxFlowerPetalLength;

        let p0 = this.evolutionParameters[0];

        this.maxNumStem = 1;
        this.maxStemLength = this.maxStemLength + Math.floor(this.maxStemLength * p0);

        this.growthNumGreen = this.maxStemLength * this.maxNumStem + ((this.maxLeafStemLength + this.maxLeafLength) * this.maxNumStem / 3) + (this.numPetals * this.maxFlowerPetalLength)
        this.growthNumRoots = this.growthNumGreen * .1;


        this.parseGenetics();

        console.log(this.genetics);
    }

    processLsqRendering() {
        // if (!this.orgVisualUpdateFlag)
        //     return;
        this.stems.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                let l = stem.lifeSquares.length;
                let i = 0;
                stem.lifeSquares.forEach((lsq) => {
                    lsq.width = .1 + .2 * Math.log(3 + l - i);
                    lsq.height = this.stemLsqHeight;
                    i += 1;
                    this.applyColor(this.colorStem, i, lsq.renderColor);
                });
                stem.lifeSquares[0].theta = stem.lifeSquares[1]?.theta ?? stem.lifeSquares[0].theta;
            })


        let j = 0;
        this.leaves.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .map((leafStem) => [leafStem, leafStem?.children.at(0)])
            .forEach((leafArr) => {
                let leafStem = leafArr[0];
                leafStem.lifeSquares.forEach((lsq) => {
                    lsq.renderMode = LSQ_RENDERMODE_THETA;
                    lsq.width = 0.3;
                    lsq.height = this.leafStemLsqHeight;
                    this.applyColor(this.colorLeaf, j, lsq.renderColor, true, .8, 2);

                });
                leafStem.lifeSquares[0].theta = leafStem.lifeSquares[1]?.theta ?? leafStem.lifeSquares[0].theta;

                if (leafArr[1] == null) {
                    return;
                }
                let leaf = leafArr[1];

                let i = 0;

                this.leafLsqHeight = 0.7;
                // let m = Math.abs(Math.sin(leaf.parentComponent.getTheta()) * Math.sin(leaf.getTwist()));

                let m = Math.max((1 - Math.abs(Math.cos(leaf.getTheta()))), (Math.abs(Math.sin(leaf.getTwist()))))

                leaf.lifeSquares.forEach((lsq) => {

                    lsq.w1 = 1 * this.leafShapeFunc((i) / (leaf.lifeSquares.length + 1));
                    lsq.w2 = 1 * this.leafShapeFunc((i + 1) / (leaf.lifeSquares.length + 1));
                    lsq.height = this.leafLsqHeight; // * m + 0.1

                    lsq.renderMode = LSQ_RENDERMODE_THETA_SLOPE;
                    i += 1;
                    j += 1;
                    this.applyColor(this.colorLeaf, j, lsq.renderColor, true, .8, 2);
                });

                leaf.lifeSquares[0].theta = leaf.lifeSquares[1]?.theta ?? leaf.lifeSquares[0].theta;

            })

        this.flowerLsqHeight = 0.5;

        this.flowers.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((flower) => {
                flower.lifeSquares.forEach((lsq) => lsq.opacity = 0);
                flower.parentComponent.lifeSquares.slice(flower.parentComponent.lifeSquares.length - 2).forEach((lsq) => this.applyColor(this.colorStemFlowerBase, 0, lsq.renderColor));

                let j = 0;
                let petalIdx = -1;

                flower.children.forEach((petal) => {
                    petalIdx += 1;
                    let petalDepth = -1;
                    petal.lifeSquares.forEach((lsq) => {
                        petalDepth += 1;
                        let col = this.flowerColor[petalDepth][petalIdx];
                        lsq.w1 = this.flowerShapeFunc((petalDepth) / (petal.lifeSquares.length + 1));
                        lsq.w2 = this.flowerShapeFunc((petalDepth + 1) / (petal.lifeSquares.length + 1));

                        let m = Math.max((1 - Math.abs(Math.cos(petal.getTheta()))), (Math.abs(Math.cos(petal.getTwist()))))

                        lsq.height = this.flowerLsqHeight * m + 0.4;

                        lsq.renderMode = LSQ_RENDERMODE_THETA_SLOPE;

                        lsq.renderColor = col;

                        // this.applyColor(col, j, lsq.renderColor);
                        j += 1;
                    });
                    petal.lifeSquares[0].theta = petal.lifeSquares[1]?.theta ?? petal.lifeSquares[0].theta;
                    petal.lifeSquares[0].w1 = .2;
                    petal.lifeSquares[0].w2 = .2;

                });
            })

    }

    growStem() {
        let startRootNode = this.originGrowth.lifeSquares.at(0);
        if (this.curNumStem > 1)
            startRootNode = this.getRootOrigin();

        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY,
            false, TYPE_STEM, STAGE_ADULT,
            ...this.getNextParams(this.stemParams));

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

    lengthenLeafStems() {
        this.leaves
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((leafStem) => leafStem.growthPlan.steps.length < this.targetLeafStemLength)
            .forEach((leafStem) => {
                let startNode = leafStem.lifeSquares.at(leafStem.lifeSquares.length - 1)
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != leafStem.growthPlan));
                    this.leaves = Array.from(this.leaves.filter((le) => this.originGrowth.getChildFromPath(le) != leafStem));
                    return;
                }
                for (let i = 0; i < this.targetLeafStemLength - leafStem.growthPlan.steps.length; i++) {
                    leafStem.growthPlan.steps.push(new GrowthPlanStep(
                        leafStem.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, this.leafStemDy)
                    ))
                };
            });
    }

    lengthenLeaves() {
        this.leaves
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .map((leafStem) => [leafStem, leafStem?.children.at(0)])
            .filter((leafArr) => leafArr[1] != null && leafArr[1].growthPlan.steps.length < this.targetLeafLength)
            .forEach((leafArr) => {
                let leafStem = leafArr[0];
                let leaf = leafArr[1];
                let startNode = leaf.lifeSquares.at(leaf.lifeSquares.length - 1)
                if (startNode == null) {
                    leafStem.children = [];
                    return;
                }
                for (let i = 0; i < this.targetLeafLength - leaf.growthPlan.steps.length; i++) {
                    leaf.growthPlan.steps.push(new GrowthPlanStep(
                        leaf.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, this.leafDy)
                    ))
                };
            });
    }

    leafStems() {
        // adds 'leaves' to the stem at some interval
        let side = 1;
        let idx = -1;

        this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((stem) => {
                for (let i = 0; i < stem.lifeSquares.length - (2 + this.maxLeafStemLength); i += 1) {
                    idx += 1;

                    let c = stem.lifeSquares[i];
                    if (c.leafNode == 1 && this.leaves[idx] != null) {
                        let leafStem = this.originGrowth.getChildFromPath(this.leaves[idx]);
                        if (leafStem.children.length == 0 && leafStem.lifeSquares.length == this.targetLeafStemLength) {
                            this.growLeafAtNode(leafStem, leafStem.lifeSquares.at(leafStem.lifeSquares.length - 1), side)
                        }
                        continue;
                    }
                    c.leafNode = 1;
                    this.growLeafStemAtNode(stem, c, side);
                    side *= -1;
                }
            })

    }


    growLeafStemAtNode(stem, startNode, side) {
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, TYPE_LEAFSTEM, STAGE_ADULT,
            ...this.getNextParams(this.leafStemParams));

        growthPlan.postConstruct = () => {
            stem.addChild(growthPlan.component);
            this.leaves.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, this.leafStemDy)
        ))

        this.growthPlans.push(growthPlan);
    }

    growLeafAtNode(stem, startNode, side) {
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, TYPE_LEAF, STAGE_ADULT,
            ...this.getNextParams(this.leafParams));

        growthPlan.postConstruct = () => {
            stem.addChild(growthPlan.component);
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, .001)
        ))

        this.growthPlans.push(growthPlan);
    }

    growFlower() {
        let stem = this.originGrowth.getChildFromPath(this.stems[this.curNumFlower]);
        let startNode = stem.lifeSquares.at(stem.lifeSquares.length - 1);
        let i = this.curNumFlower;

        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, TYPE_FLOWERNODE, STAGE_FLOWER,
            0,
            0,
            Math.PI / 2,
            0,
            0,
            10 ** 8);

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
                        false, TYPE_FLOWERPETAL, STAGE_FLOWER,
                        a,
                        a,
                        0,
                        0,
                        0,
                        10 ** 8);
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
        this.lengthenLeafStems();
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
        this.lengthenFlowerPetals();
    }
}

export class BaseLeafNodeFlowerSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, genetics, parentId) {
        super(square, evolutionParameters, genetics, parentId);
        this.proto = "BaseLeafNodeFlowerSeedOrganism";
    }

    getSproutType() {
        return BaseLeafNodeFlower;
    }
    getSproutTypeProto() {
        return "BaseLeafNodeFlower";
    }
}