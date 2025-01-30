import { randNumber, randRange } from "../../../../common.js";
import { TropicalGrassGreenSquare } from "../../../../lifeSquares/parameterized/tropical/TropicalGrassGreenSquare.js";
import { GenericParameterizedRootSquare } from "../../../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { BaseParameterizedOrganism } from "../../BaseParameterizedOrganism.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_LEAF, TYPE_TRUNK } from "../../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { WheatGreenSquare } from "../../../../lifeSquares/parameterized/agriculture/grasses/WheatGreenSquare.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../../BaseSeedOrganism.js";

export class WheatOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = WheatGreenSquare;
        this.rootType = GenericParameterizedRootSquare;

        this.trunkMaxThickness = 2;
        this.trunkCurThickness = 1;

        this.airCoef = 0.1;
        this.waterCoef = 0.1;
        this.dirtCoef = 0.1;
        this.reproductionEnergy = 10 ** 8;
        this.currentHealth = 10 ** 8;
        
        this.sproutGrowTimeInDays =  10 ** (-3);
        this.leafGrowTimeInDays =      10 ** (-3);
        this.trunkGrowTimeInDays =    10 ** (-3);

        this.side = Math.random() > 0.5 ? -1 : 1;

        // parameterized growth rules

        this.org_thicknessHeightMult = randRange(4, 5);

        this.rootOpacity = 0.05;

        this.maxNumGrass = 2;
        this.curNumGrass = 0;

        /* 
        the palm tree rules
        ------------------- 

        each node can only grow so many fronds (fraction of number of life squares in trunk)
        to grow some height, you must be at least height/n wide
        to grow a leaf of some length, you must be some fraction of that leaf length tall 
        as more height is added at the top, if there already 2 or more nodes, the "middle" node gets moved to the side (with all its children) and the new node goes in the middle
        to grow some width, you must be anchored at the bottom to a SUBTYPE_ROOTNODE root 
        roots may be promoted to SUBTYPE_ROOTNODE 
        */
    }

    growGrass() {
        if (this.curNumGrass > this.maxNumGrass) {
            return;
        }
        this.curNumGrass += 1;

        var startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        var baseDeflection = randRange(0, .1);
        var growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.3), TYPE_TRUNK, 1);
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            growthPlan.component.xOffset = 2 * (Math.random() - 0.5);
            growthPlan.component.yOffset = -(0.5 + Math.random());
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 
        for (let t = 1; t < randNumber(15,30); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.sproutGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(startRootNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.sproutGrowTimeInDays,
            () => {
                var node = this.growPlantSquare(startRootNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
    }

    planGrowth() {
        this.growGrass();
    }
}

export class WheatSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "WheatSeedOrganism";
        this.sproutCtor = (linkedSquare) => new WheatOrganism(linkedSquare)
    }
}