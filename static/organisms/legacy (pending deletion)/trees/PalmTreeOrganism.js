import { randNumber, randRange } from "../../common.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { STAGE_ADULT, STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_LEAF, TYPE_STEM } from "../Stages.js";

import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { PalmTreeGreenSquare } from "../../lifeSquares/trees/PalmTreeGreenSquare.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { UI_ORGANISM_TREE_PALM } from "../../ui/UIData.js";

export class PalmTreeOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "PalmTreeOrganism";
        this.uiRef = UI_ORGANISM_TREE_PALM;
        this.greenType = PalmTreeGreenSquare;
        this.rootType = RootLifeSquare;

        this.growthCycleMaturityLength = 40;
        this.growthCycleLength = this.growthCycleMaturityLength * 3;

        this.stems = [];
        this.leaves = [];
        this.flower = null;

        this.curLeafTheta = 0;

        this.maxNumLeaves = 4;
        this.maxStemLength = 25;
        this.maxLeafLength = 15;

        this.targetNumLeaves = this.maxNumLeaves;
        this.targetLeafLength = 1;
        this.targetStemLength = 1;

        this.growthNumGreen = this.maxNumLeaves * (this.maxLeafLength) + this.maxStemLength;
    }

    processGenetics() {
        // param 0 - shady and squat or bright and tall 
        // will also impact life cycle
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = 1 + .7 * p0;
        this.maxStemLength = 1 + Math.ceil(this.maxStemLength * p0);
        this.maxLeafLength = 1 + Math.floor(this.maxLeafLength * p0);
        this.growthNumGreen = (this.maxNumLeaves * this.maxLeafLength) + this.maxStemLength;
        this.growthNumRoots = this.growthNumGreen / 3;
    }


    growStem(parent, startNode, theta) {
        if (parent == null || startNode == null) {
            return;
        }
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            theta, 0, 0, 0,
            randRange(0, 0.05), TYPE_STEM, .5);

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
            randRange(1, 1.4),
            randRange(.8, 1.2), TYPE_LEAF, .07);

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
        if (this.stems.length == 0) {
            this.stage = STAGE_DEAD;
            return;
        }
        let parentPath = this.stems[this.stems.length - 1];
        let parent = this.originGrowth.getChildFromPath(parentPath);
        this.growStem(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE), 0);
    }

    adultGrowLeaf() {
        let parent = this.originGrowth.getChildFromPath(this.stems[this.stems.length - 1]);
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
            () => {
                let shoot = this.growPlantSquare(startNode, 0, 0);
                shoot.subtype = SUBTYPE_STEM;
                return shoot;
            }
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
                        () => {
                            let leaf = this.growPlantSquare(startNode, 0, 0);
                            leaf.subtype = SUBTYPE_LEAF;
                            return leaf;
                        }
                    ));
                };
            });
    }

    juvenileGrowthPlanning() {
        this.growStem(this.originGrowth, this.originGrowth.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_ROOTNODE), randRange(0, Math.PI * 2));
    }

    doGreenGrowth() {
        super.doGreenGrowth();
        if (this.originGrowth != null && this.stems.length > 0) {
            let stem = this.originGrowth.getChildFromPath(this.stems[0]);
            if (stem != null) {
                stem.lifeSquares.forEach((lsq) => lsq.width = .5 + .3 * Math.log(1 + this.targetStemLength));
            }
        }
    }
    adultGrowthPlanning() {
        if (this.stems.length < 1) {
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
            .some((leaf) => leaf.growthPlan.steps.length < (this.targetStemLength / 2))) {
            this.lengthenLeaves();
            return;
        }
        if (this.targetNumLeaves < this.maxNumLeaves) {
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
    }

    spawnSeed() {
        if (this.originGrowth == null || this.leaves.length == 0) {
            return;
        }

        let num = randNumber(1, 2)
        for (let i = 0; i < num; i++) {
            let chosen = this.leaves.at(randNumber(0, this.leaves.length - 1));
            let comp = this.originGrowth.getChildFromPath(chosen);
            let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
            let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY()));
            if (seedSquare) {
                seedSquare.speedY = -Math.round(randRange(-2, -5)); 
                seedSquare.speedX = Math.round(randRange(-5, 5));
                let orgAdded = new PalmTreeSeedOrganism(seedSquare, this.getNextGenetics());
                if (!orgAdded) {
                    seedSquare.destroy();
                }
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
        if (this.stage == STAGE_ADULT || this.stage == STAGE_FLOWER) {
            this.adultGrowthPlanning();
        }
    }
}


export class PalmTreeSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "PalmTreeSeedOrganism";
    }

    getSproutType() {
        return PalmTreeOrganism;
    }
    getSproutTypeProto() {
        return "PalmTreeOrganism";
    }
}