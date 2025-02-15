import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_LEAF, TYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { WheatGreenSquare } from "../../lifeSquares/parameterized/agriculture/grasses/WheatGreenSquare.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";

// ref: https://prairiecalifornian.com/wheat-growth-stages/
export class WheatOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WheatOrganism";
        this.greenType = WheatGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;

        this.stems = [];
        this.curNumStems = 0;
        this.targetNumStems = 5;
        this.maxNumStems = 5;

        this.leaves = [];
        this.curNumLeaves = 0;
        this.targetNumLeaves = 5;
        this.maxNumLeaves = 5;
        
        this.curLeafLength = 0;
        this.targetLeafLength = 8;
        this.targetStemLength = 3;

    }

    growStem(parent, startNode, theta) {
        if (parent == null || startNode == null) {
            return;
        }
        var growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, 
            theta, 0, 0, 0, 
            randRange(0, 0.05), TYPE_STEM, 100);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.stems.push(growthPlan.component);
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                var node = this.growPlantSquare(startNode, 0,growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
        this.curNumStems += 1;
        this.growthPlans.push(growthPlan);
    }

    growLeaf(parent, startNode) {
        if (parent == null || startNode == null) {
            return;
        }
        var growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, randRange(0, Math.PI * 2), 0, 0, 
            randRange(0.2, 0.4), 
            randRange(0.7, 1.3), TYPE_LEAF, 1);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.leaves.push(growthPlan.component);
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                var node = this.growPlantSquare(startNode, 0,growthPlan.steps.length);
                node.subtype = SUBTYPE_LEAF;
                return node;
            },
            null
        ))
        this.curNumLeaves += 1;
        this.growthPlans.push(growthPlan);
    }

    adultGrowStem() {
        var parent = this.stems[this.stems.length - 1];
        this.growStem(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE), 0);
    }

    adultGrowLeaf() {
        var parent = this.stems.find((stem) => !stem.children.some((child) => child.growthPlan.type == TYPE_LEAF));
        if (parent == null) {
            return;
        }
        this.growLeaf(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE));
    }

    lengthenStems() {
        this.stems.filter((stem) => stem.growthPlan.steps.length < this.targetStemLength)
        .forEach((stem) => {
            let startNode = stem.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE)
            for (let i = 0; i < this.targetStemLength - stem.growthPlan.steps.length; i++) {
                stem.growthPlan.steps.push(new GrowthPlanStep(
                    stem.growthPlan,
                    0,
                    this.grassGrowTimeInDays,
                    () => {
                        var shoot = this.growPlantSquare(startNode, 0, 0);
                        shoot.subtype = SUBTYPE_STEM;
                        return shoot;
                    },
                    null
                ))
            };
            stem.growthPlan.completed = false;
        })
    } 
    lengthenLeaves() {
        this.leaves.filter((leaf) => leaf.growthPlan.steps.length < this.targetLeafLength)
        .forEach((leaf) => {
            let startNode = leaf.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_LEAF)
            for (let i = 0; i < this.targetLeafLength - leaf.growthPlan.steps.length; i++) {
                leaf.growthPlan.steps.push(new GrowthPlanStep(
                    leaf.growthPlan,
                    0,
                    this.grassGrowTimeInDays,
                    () => {
                        var leaf = this.growPlantSquare(startNode, 0, 0);
                        leaf.subtype = SUBTYPE_LEAF;
                        return leaf;
                    },
                    null
                ))
            };
            leaf.growthPlan.completed = false;
        })
    }

    growFlower() {}

    juvenileGrowthPlanning() {
        this.growStem(this.originGrowth, this.originGrowth.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_ROOTNODE), randRange(0, Math.PI * 2));
    }

    adultGrowthPlanning() {
        if (this.curNumStems == this.stems.length && this.curNumStems < this.targetNumStems) {
            this.adultGrowStem();
            return;
        }

        if (this.stems.some((stem) => stem.growthPlan.steps.length < this.targetStemLength)) {
            this.lengthenStems();
            return;
        }

        if (this.curNumLeaves == this.leaves.length && this.curNumLeaves < this.targetNumLeaves) {
            this.adultGrowLeaf();
            return;
        }

        if (this.leaves.some((leaf) => leaf.growthPlan.steps.length < this.targetLeafLength)) {
            this.lengthenLeaves();
            return;
        }

        if (this.nitrogen > this.growthNitrogen && this.phosphorus > this.growthPhosphorus && this.lightlevel > this.growthLightLevel) {
            this.growFlower();
            return;
        }
    }

    planGrowth() {
        super.planGrowth();
        if (this.originGrowth == null) {
            return;
        }
        if (this.stage == STAGE_JUVENILE) {
            this.juvenileGrowthPlanning();
        }
        if (this.stage == STAGE_ADULT) {
            this.adultGrowthPlanning();
        }

        

    }

    process() {
        super.process();
        this.nitrogen = 10 ** 8;
        this.phosphorus = 10 ** 8;
        this.lightlevel = 10 ** 8;
        this.executeGrowthPlans();
    }
}

export class WheatSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "WheatSeedOrganism";
    }

    getSproutType() {
        return WheatOrganism;
    }
}