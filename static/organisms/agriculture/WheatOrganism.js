import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_FLOWER, TYPE_LEAF, TYPE_STEM, TYPE_TRUNK } from "../Stages.js";
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
        this.leaves = [];
        this.flower = null;

        this.curLeafTheta = 0;

        this.maxNumNodes = 7;
        this.maxStemLength = 4;
        this.maxLeafLength = 8;
        this.maxFlowerLength = 6;

        this.targetNumStems = 1;
        this.targetNumLeaves = 1;
        this.targetLeafLength = 1;
        this.targetStemLength = 1;
        this.targetFlowerLength = this.maxFlowerLength;

        this.growthNumGreen = this.maxNumNodes * (this.maxStemLength + this.maxLeafLength);
    
    }

    growStem(parent, startNode, theta) {
        if (parent == null || startNode == null) {
            return;
        }
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, 
            theta, 0, 0, 0, 
            randRange(0, 0.05), TYPE_STEM, 10);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.stems.push(this.originGrowth.getChildPath(growthPlan.component));
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let node = this.growPlantSquare(startNode, 0,growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
    }

    growLeaf(parent, startNode) {
        if (parent == null || startNode == null) {
            return;
        }
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, this.curLeafTheta, 0, 0, 
            randRange(0.5, 0.8), 
            randRange(.3, .6), TYPE_LEAF, 1);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.leaves.push(this.originGrowth.getChildPath(growthPlan.component));
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let node = this.growPlantSquare(startNode, 0,growthPlan.steps.length);
                node.subtype = SUBTYPE_LEAF;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
        this.curLeafTheta += randRange(Math.PI / 2, Math.PI);
    }

    adultGrowStem() {
        let parentPath = this.stems[this.stems.length - 1];
        let parent = this.originGrowth.getChildFromPath(parentPath);
        this.growStem(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE), 0);
    }

    adultGrowLeaf() {
        let parent = this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .find((stem) => !stem.children.some((child) => child.growthPlan.type == TYPE_LEAF));
        if (parent == null) {
            return;
        }
        this.growLeaf(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE));
    }

    lengthenStems() {
        let stem = this.stems
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((stem) => stem.growthPlan.steps.length < this.targetStemLength).at(0);
        let startNode = stem.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE);
        if (startNode == null) {
            this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != stem.growthPlan));
            this.stems = Array.from(this.stems.filter((st) => this.originGrowth.getChildFromPath(st) != stem));
            return;
        }
        stem.growthPlan.steps.push(new GrowthPlanStep(
            stem.growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let shoot = this.growPlantSquare(startNode, 0, 0);
                shoot.subtype = SUBTYPE_STEM;
                return shoot;
            },
            null
        ))
        stem.growthPlan.completed = false;
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
                    return;
                }

                for (let i = 0; i < this.targetLeafLength - leaf.growthPlan.steps.length; i++) {
                    leaf.growthPlan.steps.push(new GrowthPlanStep(
                        leaf.growthPlan,
                        0,
                        this.grassGrowTimeInDays,
                        () => {
                            let leaf = this.growPlantSquare(startNode, 0, 0);
                            leaf.subtype = SUBTYPE_LEAF;
                            return leaf;
                        },
                        null
                    ))
                };
                leaf.growthPlan.completed = false;
            })
    }

    growFlower() {
        let parentPath = this.stems[this.stems.length - 1];
        let parent = this.originGrowth.getChildFromPath(parentPath);
        let startNode = parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE);

        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, 
            this.curLeafTheta, 0, 0, .05, 
            randRange(0.15, 0.25), TYPE_FLOWER, 1);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.flower = this.originGrowth.getChildPath(growthPlan.component);
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let node = this.growPlantSquare(startNode, 0,growthPlan.steps.length);
                node.subtype = SUBTYPE_FLOWERNODE;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
    }

    lengthenFlower() {
        let flowerComponent = this.originGrowth.getChildFromPath(this.flower);
        let startNode = flowerComponent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_FLOWERNODE);
        if (startNode == null) {
            this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != flowerComponent.growthPlan));
            this.flower = null;
            return;
        }
        flowerComponent.growthPlan.steps.push(new GrowthPlanStep(
            flowerComponent.growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let flower = this.growPlantSquare(startNode, 0, 0);
                flower.subtype = SUBTYPE_FLOWER;
                return flower;
            },
            null
        ))
        flowerComponent.growthPlan.completed = false;
    }

    juvenileGrowthPlanning() {
        this.growStem(this.originGrowth, this.originGrowth.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_ROOTNODE), randRange(0, Math.PI * 2));
    }

    adultGrowthPlanning() {
        if (this.growthPlans.some((gp) => !gp.completed)) {
            this.executeGrowthPlans();
            return;
        }

        if (this.stems.length < this.targetNumStems) {
            this.adultGrowStem();
            return;
        }

        if (this.stems
                .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
                .some((stem) => stem.growthPlan.steps.length < this.targetStemLength)) {
            this.lengthenStems();
            return;
        }

        if (this.leaves.length < this.targetNumLeaves) {
            this.adultGrowLeaf();
            return;
        }

        if (this.leaves
                .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
                .some((leaf) => leaf.growthPlan.steps.length < Math.min(this.targetStemLength * (this.maxLeafLength / this.maxStemLength), this.targetLeafLength))) {
            this.lengthenLeaves();
            return;
        }

        if (this.targetNumStems < this.maxNumNodes) {
            this.targetNumStems += 1;
            this.targetNumLeaves += 1;
            return;
        }
        if (this.targetLeafLength < this.maxLeafLength) {
            this.targetLeafLength += 1;
            return;
        }
        if (this.targetStemLength < this.maxStemLength && this.targetLeafLength == this.maxLeafLength) {
            this.targetStemLength += 1;
            return;
        }
        
        if (this.nitrogen > this.growthNitrogen && 
            this.phosphorus > this.growthPhosphorus && 
            this.lightlevel > this.growthLightLevel) {
            if (this.flower == null) {
                this.growFlower();
                return;
            }
            let flowerComponent = this.originGrowth.getChildFromPath(this.flower);
            if (flowerComponent.growthPlan.steps.length < this.targetFlowerLength) {
                this.lengthenFlower();
                return;
            }
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