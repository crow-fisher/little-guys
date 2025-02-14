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
        this.targetNumStems = 5;
        this.maxNumStems = 5;

        this.leaves = [];
        this.targetNumLeaves = 5;
        this.maxNumLeaves = 5;
        
        this.targetLeafLength = 5;
        this.targetStemLength = 5;

    }

    growStem(parent, startNode) {
        var baseDeflection = randRange(0, .1);
        var growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.3), TYPE_STEM, 1);

        growthPlan.postConstruct = () => {
            parent.addChild(growthPlan.component);
            this.stems.push(growthPlan.component);
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 

        for (let t = 1; t < randNumber(1, 2); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.grassGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(startNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                var node = this.growPlantSquare(startNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
    }

    adultGrowStem() {
        var parent = this.stems[this.stems.length - 1];
        this.growStem(parent, parent.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_NODE));
    }
    growLeaf() {}
    lengthenStems() {} 
    lengthenLeaves() {}
    growFlower() {}

    juvenileGrowthPlanning() {
        this.growStem(this.originGrowth, this.originGrowth.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_ROOTNODE));
    }

    adultGrowthPlanning() {
        if (this.stems.length < this.targetNumStems) {
            this.adultGrowStem();
            return;
        }

        if (this.leaves.length < this.targetNumLeaves) {
            this.growLeaf();
            return;
        }

        if (this.stems.some((stem) => stem.growthPlan.steps.length < this.targetStemLength)) {
            this.lengthenStems();
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