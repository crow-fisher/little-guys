import { randNumber, randRange } from "../../../common.js";
import { LilyOfTheValleyGreenSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyGreenSquare.js";
import { LilyOfTheValleyRootSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT } from "../Stages.js";

export class LilyOfTheValleyOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = LilyOfTheValleyGreenSquare;
        this.rootType = LilyOfTheValleyRootSquare;
    }

    gp_juvenile() {
        if (!(STAGE_JUVENILE in this.stageGrowthCount)) {
            this.stageGrowthCount[STAGE_JUVENILE] = 0;
        }
        if (this.stageGrowthCount[STAGE_JUVENILE] > 0) {
            return null;
        }
        
        var startGreen = this.getOriginForNewGrowth(SUBTYPE_SPROUT);
        var growthPlan = new GrowthPlan(startGreen.posX, startGreen.posY, false, STAGE_ADULT, randRange(0, 1) - 1, Math.random() / 3, 1);
        growthPlan.postConstruct = () => this.originGrowth.children.push(growthPlan.component);
        for (let t = 1; t < randNumber(10, 30); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.00001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startGreen, 0, t);
                    shoot.subtype = SUBTYPE_SHOOT;
                    return shoot;
                }
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            0.00001,
            () => this.plantLastGrown,
            (time) => this.plantLastGrown = time,
            () => {
                var node = this.growPlantSquare(startGreen, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            }
        ))

        this.stageGrowthCount[STAGE_JUVENILE] += 1;
        return growthPlan;
    }

    gp_adult() {
        if (!(STAGE_ADULT in this.stageGrowthCount)) {
            this.stageGrowthCount[STAGE_ADULT] = 0;
        }
        if (this.stageGrowthCount[STAGE_ADULT] > 3) {
            return null;
        }
        var startNode = this.getOriginForNewGrowth(SUBTYPE_NODE);
        var startComponent = startNode.component;
        var growthPlan = new GrowthPlan(startNode.posX, startNode.posY, false, STAGE_ADULT, randRange(0, 1) - 1, Math.random() / 3, 1);
        growthPlan.postConstruct = () => startComponent.children.push(growthPlan.component);
        for (let t = 1; t < randNumber(10, 30); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.00001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startNode, 0, t);
                    shoot.subtype = SUBTYPE_SHOOT;
                    return shoot;
                }
            ))
        }
        this.stageGrowthCount[STAGE_ADULT] += 1;
        return growthPlan;
    }

    growAndDecay() {
        super.growAndDecay();
        if (this.stage == STAGE_JUVENILE) {
            var plan = this.gp_juvenile();
            if (plan != null)
                this.growthPlans.push(plan);
        }
        if (this.stage == STAGE_ADULT) {
            var plan = this.gp_adult();
            if (plan != null)
                this.growthPlans.push(plan);
        }
    }
}