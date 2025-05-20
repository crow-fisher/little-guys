import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_FLOWER, TYPE_LEAF, TYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { WheatGreenSquare } from "../../lifeSquares/parameterized/agriculture/grasses/WheatGreenSquare.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { addNewOrganism } from "../_orgOperations.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";

// ref: https://prairiecalifornian.com/wheat-growth-stages/
export class WheatOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WheatOrganism";
        this.greenType = WheatGreenSquare;
        this.rootType = GenericParameterizedRootSquare;

        this.growthCycleMaturityLength = 20;
        this.growthCycleLength = this.growthCycleMaturityLength * 2;

        this.stems = [];
        this.leaves = [];
        this.flower = null;

        this.curLeafTheta = 0;

        this.maxNumNodes = 7;
        this.maxStemLength = 4;
        this.maxLeafLength = 8;
        this.maxFlowerLength = 4;

        this.targetNumStems = 1;
        this.targetNumLeaves = 1;
        this.targetLeafLength = 3;
        this.targetStemLength = 1;
        this.targetFlowerLength = this.maxFlowerLength;

        this.growthLightLevel = 0.5;

        this.growthNumGreen = this.maxNumNodes * (this.maxStemLength + this.maxLeafLength);
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = 0.1 + 1 * p0;

        this.maxNumNodes = 3 + Math.floor(this.maxNumNodes * p0);
        this.maxStemLength = 2 + Math.floor(this.maxStemLength * p0);
        this.maxGrassLength = 4 + Math.floor(this.maxGrassLength * p0);
        this.maxLeafLength = 2 + Math.floor(this.maxLeafLength * p0);

        this.growthNumGreen = this.maxNumNodes * (this.maxStemLength + this.maxLeafLength);
        this.growthNumRoots = this.growthNumGreen * 0.2;
    }

    growStem(parent, startNode, theta) {
        if (parent == null || startNode == null) {
            return;
        }
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            theta, 0, 0, 0,
            randRange(0, 0.05), TYPE_STEM, 1 * this.maxNumNodes);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.stems.push(this.originGrowth.getChildPath(growthPlan.component));
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let node = this.growPlantSquare(startNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            }
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
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let node = this.growPlantSquare(startNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_LEAF;
                return node;
            }
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
            () => this.growGreenSquareAction(startNode, SUBTYPE_STEM)
        ));
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
                        () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF)
                    ))
                };
            })
    }

    growFlower() {
        let parentPath = this.stems[this.stems.length - 1];
        let parent = this.originGrowth.getChildFromPath(parentPath);
        let startNode = parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE);

        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_FLOWER,
            this.curLeafTheta, 0, 0, .05,
            randRange(0.15, 0.25), TYPE_FLOWER, 1);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.flower = this.originGrowth.getChildPath(growthPlan.component);
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startNode, SUBTYPE_FLOWERNODE)
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
            () => {
                let flower = this.growPlantSquare(startNode, 0, 0);
                flower.subtype = SUBTYPE_FLOWER;
                return flower;
            }
        ));
    }

    juvenileGrowthPlanning() {
        this.growStem(this.originGrowth, this.originGrowth.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_ROOTNODE), randRange(0, Math.PI * 2));
    }

    flowerGrowthPlanning() {
        if (this.flower == null) {
            return;
        }
        let flowerComponent = this.originGrowth.getChildFromPath(this.flower);
        if (flowerComponent.growthPlan.steps.length < this.targetFlowerLength) {
            this.lengthenFlower();
        }
    }

    adultGrowthPlanning() {
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

        if (this.flower == null) {
            this.growFlower();
            return;
        }


    }

    spawnSeed() {
        if (this.flower == null) {
            this.growFlower();
            return;
        }

        let flowerComponent = this.originGrowth.getChildFromPath(this.flower);
        let startNode = flowerComponent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_FLOWERNODE);
        let seedSquare = addSquare(new SeedSquare(startNode.getPosX(), startNode.getPosY()));
        if (seedSquare) {
            seedSquare.speedY = -Math.round(randRange(-2, -5));
            seedSquare.speedX = Math.round(randRange(-5, 5));
            let orgAdded = addNewOrganism(new WheatSeedOrganism(seedSquare, this.getNextGenetics()));
            if (!orgAdded) {
                seedSquare.destroy();
            }
        }

        let reduction = 0.5;
        this.nitrogen *= (1 - reduction);
        this.phosphorus *= (1 - reduction);
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.originGrowth == null) {
            return;
        }
        if (this.stage == STAGE_JUVENILE) {
            this.juvenileGrowthPlanning();
        }
        if (this.stage == STAGE_ADULT) {
            this.adultGrowthPlanning();
        }
        if (this.stage == STAGE_FLOWER) {
            this.flowerGrowthPlanning();
        }
    }
}

export class WheatSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "WheatSeedOrganism";
    }

    getSproutType() {
        return WheatOrganism;
    }
}