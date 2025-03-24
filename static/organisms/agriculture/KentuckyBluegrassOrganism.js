import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { KentuckyBluegrassGreenSquare } from "../../lifeSquares/parameterized/agriculture/grasses/KentuckyBluegrassGreenSquare.js";

export class KentuckyBluegrassOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "KentuckyBluegrassOrganism";
        this.greenType = KentuckyBluegrassGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;
        this.maxNumGrass = 24;
        this.curNumGrass = 0;
        this.grassLengthMin = 2;
        this.grassLengthMax = 8;
        this.numGrowthCycles = 10 ** 8; // grass never dies
        this.growthCycleMaturityLength = 10;
        this.growthCycleLength = 10;
    }

    growGrass() {
        if (this.curNumGrass > this.maxNumGrass) {
            return;
        }
        this.curNumGrass += 1;

        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let baseDeflection = randRange(0, .1);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.3), TYPE_TRUNK, 1);
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            growthPlan.component.xOffset = 4 * (Math.random() - 0.5);
            growthPlan.component.yOffset = - (4 * (0.5 + Math.random()));
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 
        for (let t = 1; t < randNumber(this.grassLengthMin, this.grassLengthMax); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.grassGrowTimeInDays,
                () => {
                    let shoot = this.growPlantSquare(startRootNode, 0, t);
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
                let node = this.growPlantSquare(startRootNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
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
        this.growGrass();
    }
}

export class KentuckyBluegrassSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "KentuckyBluegrassSeedOrganism";
    }

    getSproutType() {
        return KentuckyBluegrassOrganism;
    }
}