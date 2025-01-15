import { randNumber, randRange } from "../../../common.js";
import { LilyOfTheValleyGreenSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyGreenSquare.js";
import { LilyOfTheValleyRootSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_SHOOT, SUBTYPE_SPROUT } from "../Stages.js";

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
        var growthPlan = new GrowthPlan(startGreen.posX, startGreen.posY, false, STAGE_JUVENILE, randRange(0, 1) - 1, Math.random() / 3, 1);
        growthPlan.postConstruct = () => this.originGrowth.children.push(growthPlan.getGrowthComponent());
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
        this.stageGrowthCount[STAGE_JUVENILE] += 1;
        return growthPlan;
    }

    growAndDecay() {
        super.growAndDecay();
        if (this.stage == STAGE_JUVENILE) {
            var plan = this.gp_juvenile();
            if (plan != null)
                this.growthPlans.push(plan);
        }
    }
}