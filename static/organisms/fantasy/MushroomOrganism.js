import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, TYPE_FLOWER, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { MushroomGreenSquare } from "../../lifeSquares/parameterized/fantasy/MushroomGreenSquare.js";

export class MushroomOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "MushroomOrganism";
        this.greenType = MushroomGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;
        this.maxNumGrass = 4;
        this.curNumGrass = 0;
        this.numGrowthCycles = 10 ** 8; 
        this.growthCycleMaturityLength = 1;
        this.growthCycleLength = 1;
        this.grasses = [];

        this.minLength = 10;
        this.maxLength = 35;
        this.flowerMaxLen = 4;

        this.curFloweredGrasses = 0;
        this.maxFloweredGrasses = this.maxNumGrass - 2;
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
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component));
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 
        let stemLength = randNumber(this.minLength,this.maxLength);
        let flowerLength = randNumber(3, 5);

        for (let t = 1; t < stemLength; t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.grassGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(startRootNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            ))
        }

        for (let i = 0; i < flowerLength; i++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.grassGrowTimeInDays,
                () => {
                    var node = this.growPlantSquare(startRootNode, 0, stemLength + i);
                    node.subtype = SUBTYPE_FLOWER;
                    return node;
                },
                null
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                var node = this.growPlantSquare(startRootNode, 0, stemLength + flowerLength);
                node.subtype = SUBTYPE_STEM;
                return node;
            },
            null
        ));
        this.growthPlans.push(growthPlan);
    }


    planGrowth() {
        super.planGrowth();
        if (this.originGrowth == null) {
            return;
        }
        if (this.curNumGrass == 0) {
            this.growGrass();
            return;
        }
        if (Math.random() > 0.95) {
            if (this.getCurGrowthFrac() > 0.2) {
                this.growGrass();
            }
        }
    }
}

export class MushroomSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "MushroomSeedOrganism";
    }

    getSproutType() {
        return MushroomOrganism;
    }
}