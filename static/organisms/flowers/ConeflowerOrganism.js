import { randRange } from "../../common.js";
import { GenericRootSquare } from "../../lifeSquares/GenericRootSquare.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_JUVENILE, SUBTYPE_FLOWER, SUBTYPE_FLOWERBUD, SUBTYPE_FLOWERNODE, SUBTYPE_FLOWERTIP, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_FLOWERNODE, TYPE_FLOWERPETAL, TYPE_LEAF, TYPE_STEM } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { addNewOrganism } from "../_orgOperations.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { ConeflowerGreenSqaure } from "../../lifeSquares/flowers/ConeflowerGreenSqaure.js";
import { UI_ORGANISM_FLOWER_CONEFLOWER } from "../../ui/UIData.js";

// ref: https://prairiecalifornian.com/wheat-growth-stages/
export class ConeflowerOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "ConeflowerOrganism";
        this.uiRef = UI_ORGANISM_FLOWER_CONEFLOWER;
        this.greenType = ConeflowerGreenSqaure;
        this.rootType = GenericRootSquare;

        this.growthCycleMaturityLength = 20;
        this.growthCycleLength = this.growthCycleMaturityLength * 2;

        this.stems = [];
        this.leaves = [];
        this.flower = null;

        this.curLeafTheta = 0;

        this.maxNumNodes = 4;
        this.maxStemLength = 3;
        this.maxLeafLength = 4;
        this.maxFlowerLength = 4;

        this.targetNumStems = 1;
        this.targetNumLeaves = 1;
        this.targetLeafLength = 3;
        this.targetStemLength = 1;
        this.targetFlowerLength = this.maxFlowerLength;

        this.numPetals = 7;

        this.growthLightLevel = 0.5;

        this.growthNumGreen = this.maxNumNodes * (this.maxStemLength + this.maxLeafLength);
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = 0.1 + 1 * p0;

        this.maxNumNodes = 3 + Math.floor(this.maxNumNodes * p0);
        this.targetNumLeaves = -1;
        this.maxStemLength = 2 + Math.floor(this.maxStemLength * p0);
        this.maxLeafLength = 2 + Math.floor(this.maxLeafLength * p0);

        this.growthNumGreen = this.maxNumNodes * (this.maxStemLength + this.maxLeafLength) + 12;
        this.growthNumRoots = this.growthNumGreen * 0.2;
        this.targetStemLength = this.maxStemLength;
    }

    growStem(parent, startNode, theta) {
        if (parent == null || startNode == null) {
            return;
        }
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            theta, 0, 0, randRange(0, 0.1),
            randRange(0.05, 0.15), TYPE_STEM, 3 * this.maxNumNodes);

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
            false, STAGE_ADULT, this.curLeafTheta, 0, 0.75,
            randRange(Math.PI / 2, Math.PI),
            randRange(.05, .10), TYPE_LEAF, 1);

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

        if (this.stems.length == this.maxNumNodes) {
            let lastStemPath = this.stems.at(this.stems.length - 1);
            let lastStem = this.originGrowth.getChildFromPath(lastStemPath);
            if (lastStem.growthPlan.steps.length < this.targetStemLength * 3) {
                lastStem.growthPlan.steps.push(new GrowthPlanStep(
                    lastStem.growthPlan,
                    () => this.growGreenSquareAction(lastStem.lifeSquares.at(lastStem.lifeSquares.length - 1), SUBTYPE_STEM)
                ));
            }
        }

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
        if (this.targetLeafLength < this.maxLeafLength || this.targetStemLength < this.maxStemLength)
            return;

        let parentPath = this.stems[this.stems.length - 1];
        let parent = this.originGrowth.getChildFromPath(parentPath);
        let startNode = parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE);

        if (startNode == null) {
            return;
        }

        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_FLOWER,
            0, -Math.PI, 0, .05,
            randRange(0.15, 0.25), TYPE_FLOWERNODE, 10 ** 8);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.flower = this.originGrowth.getChildPath(growthPlan.component);
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let ret = this.growGreenSquareAction(startNode, SUBTYPE_FLOWERBUD, 0);
                startNode.opacity = 0;
                return ret;
            }
        ));
        this.growthPlans.push(growthPlan);
    }

    doGreenGrowth() {
        if (super.doGreenGrowth()) {
            for (let i = 0; i < this.stems.length; i++) {
                let curStem = this.originGrowth.getChildFromPath(this.stems.at(i));
                let curStemWidth = 0.7 - (0.05 * i);
                curStem.lifeSquares.forEach((lsq) => lsq.width = curStemWidth);

                let childLeaf = curStem.children.find((child) => child.type == TYPE_LEAF);
                if (childLeaf != null) {
                    childLeaf.lifeSquares.at(0).width = curStemWidth;
                    let curLeafChildWidth = curStemWidth * 1.2;
                    childLeaf.lifeSquares.slice(1).forEach((lsq) => {
                        lsq.width = curLeafChildWidth;
                        curLeafChildWidth *= 0.7;
                    });
                }
            }
        }
    }

    growFlowerPetals() {
        let flowerNodeComponent = this.originGrowth.getChildFromPath(this.flower);
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
                    0, Math.PI * randRange(0.1, 0.2), 0,
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
    }

    lengthenFlowerPetals() {
        this.originGrowth.getChildFromPath(this.flower).children.forEach((child) => {
            if (child.growthPlan.steps.length < 3) {
                child.growthPlan.steps.push(new GrowthPlanStep(
                    child.growthPlan,
                    () => this.growGreenSquareAction(child.lifeSquares.at(child.lifeSquares.length - 1), SUBTYPE_FLOWER)
                ));
            }
        })
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
            this.growFlowerPetals();
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
        }

        if (this.leaves
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((leaf) => leaf.growthPlan.steps.length < Math.min(this.targetStemLength * (this.maxLeafLength / this.maxStemLength), this.targetLeafLength))) {
            this.lengthenLeaves();
        }

        if (this.targetNumStems < this.maxNumNodes) {
            this.targetNumStems += 1;
            this.targetNumLeaves += 1;
            this.targetLeafLength = Math.min(this.targetLeafLength + 1, this.maxLeafLength);
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
        if (startNode == null) {
            this.growFlowerPetals();
            return;
        }
        let seedSquare = addSquare(new SeedSquare(startNode.getPosX(), startNode.getPosY()));
        if (seedSquare) {
            seedSquare.speedY = -Math.round(randRange(-2, -5));
            seedSquare.speedX = Math.round(randRange(-5, 5));
            let orgAdded = addNewOrganism(new ConeflowerSeedOrganism(seedSquare, this.getNextGenetics()));
            if (!orgAdded) {
                seedSquare.destroy();
            }
        }

        this.nitrogen *= (1 - this.seedReduction());
        this.phosphorus *= (1 - this.seedReduction());
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
            this.adultGrowthPlanning();
            this.flowerGrowthPlanning();
        }
    }
}

export class ConeflowerSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "ConeflowerSeedOrganism";
    }

    getSproutType() {
        return ConeflowerOrganism;
    }
}