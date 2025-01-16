import { randNumber, randRange } from "../../../common.js";
import { PalmTreeGreenSquare } from "../../../lifeSquares/parameterized/woodland/PalmTreeGreenSquare.js";
import { PalmTreeRootSquare } from "../../../lifeSquares/parameterized/woodland/PalmTreeRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_TRUNK, SUBTYPE_TRUNK_CORE } from "../Stages.js";

export class PalmTreeOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = PalmTreeGreenSquare;
        this.rootType = PalmTreeRootSquare;

        this.trunkMaxThickness = 2;
        this.trunkCurThickness = 0;
    }

    gp_juvenile() {
        if (!(STAGE_JUVENILE in this.stageGrowthPlans)) {
            this.stageGrowthPlans[STAGE_JUVENILE] = new Array();
        }
        if (this.stageGrowthPlans[STAGE_JUVENILE].length > 0) {
            return null;
        }
        
        var startGreen = this.getOriginsForNewGrowth(SUBTYPE_SPROUT).at(0);
        var growthPlan = new GrowthPlan(startGreen.posX, startGreen.posY, false, STAGE_ADULT, randRange(0, 1) - 1, Math.random() / 3, 1);
        growthPlan.postConstruct = () => {this.originGrowth.addChild(growthPlan.component); this.trunkCurThickness += 1};
        for (let t = 1; t < randNumber(10, 30); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startGreen, 0, t);
                    shoot.subtype = SUBTYPE_TRUNK_CORE;
                    return shoot;
                }
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            0.001,
            () => this.plantLastGrown,
            (time) => this.plantLastGrown = time,
            () => {
                var node = this.growPlantSquare(startGreen, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            }
        ))

        this.stageGrowthPlans[STAGE_JUVENILE].push(growthPlan);
        return growthPlan;
    }

    gp_adult() {
        if (!(STAGE_ADULT in this.stageGrowthPlans)) {
            this.stageGrowthPlans[STAGE_ADULT] = new Array();
        }
        if (this.stageGrowthPlans[STAGE_ADULT].length > 4) {
            return;
        }
        var startNode = this.getOriginsForNewGrowth(SUBTYPE_NODE).at(0);
        if (startNode == null) {
            return;
        }
        var startComponent = startNode.component;
        var growthPlan = new GrowthPlan(startNode.posX, startNode.posY, false, STAGE_ADULT, randRange(0, 1) - 1, Math.random() / 3, 1);
        growthPlan.postConstruct = () => startComponent.addChild(growthPlan.component);
        for (let t = 1; t < randNumber(10, 50); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startNode, 0, t);
                    shoot.subtype = SUBTYPE_SHOOT;
                    return shoot;
                }
            ))
        }
        this.stageGrowthPlans[STAGE_ADULT].push(growthPlan);
        return growthPlan;
    }

    addTrunkToGrowthPlan(growthPlan) {
        if (this.trunkCurThickness < this.trunkMaxThickness) {
            growthPlan.completed = false;
            this.getOriginsForNewGrowth(SUBTYPE_TRUNK_CORE).forEach((trunk) => 
                growthPlan.steps.push(new GrowthPlanStep(
                    growthPlan,
                    0,
                    0.0004,
                    () => this.plantLastGrown,
                    (time) => this.plantLastGrown = time,
                    () => {
                        var node = this.growPlantSquare(trunk, -1, 0);
                        node.subtype = SUBTYPE_TRUNK;
                        return node;
                    }
            )));
            growthPlan.postConstruct = () => this.trunkCurThickness += 1;   
        }

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
            else {
                this.addTrunkToGrowthPlan(this.stageGrowthPlans[STAGE_JUVENILE].at(0))
            }
        }
    }
}