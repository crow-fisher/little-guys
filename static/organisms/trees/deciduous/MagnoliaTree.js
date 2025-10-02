import { randNumber, randRange } from "../../../common.js";
import { GenericRootSquare } from "../../../lifeSquares/GenericRootSquare.js";
import { STAGE_ADULT, STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_LEAF, TYPE_STEM } from "../../Stages.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { BaseOrganism } from "../../BaseOrganism.js";
import { PalmTreeGreenSquare } from "../../../lifeSquares/trees/PalmTreeGreenSquare.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { UI_ORGANISM_TREE_MAGNOLIA } from "../../../ui/UIData.js";

export class MagnoliaTree extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "MagnoliaTreeOrganism";
        this.uiRef = UI_ORGANISM_TREE_MAGNOLIA;
        this.greenType = PalmTreeGreenSquare;
        this.rootType = GenericRootSquare;

        this.growthCycleLength = 10 ** 8;
    }

    treeGrowthPlanning() {
        // greedily search for something we can do 
        // each component length can be of some size 
        // and once it reaches that size, then it grows a child.
        // children must grow some distnace apart from each other
        this._treeGrowthPlanning(this.originGrowth.growthPlan);
    }

    _treeGrowthPlanning(growthPlan, startNode) {
        if (growthPlan.steps.length < 5) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                () => this.growGreenSquareAction((startNode ?? growthPlan.component.lifeSquares.at(0)), SUBTYPE_STEM)
            ));
            return true;
        }
        if (growthPlan.component.children.length > 1) {
            // if we cannot grow, try to grow one of our children
            return growthPlan.component.children.find((child) => this._treeGrowthPlanning(child.growthPlan));
        } else {
            // grow new child
            let startNode = growthPlan.component.lifeSquares.at(randNumber(3, 4));
            let newGrowthPlan = new GrowthPlan(
                startNode.posX, startNode.posY,
                false, STAGE_ADULT,
                randRange(0, Math.PI * 2), 0, 0, randRange(0, 0.1),
                randRange(0.05, 0.15), TYPE_STEM, .01);
            newGrowthPlan.postConstruct = () => {  
                growthPlan.component.addChild(newGrowthPlan.component);
            };
            this._treeGrowthPlanning(newGrowthPlan, startNode);
            this.growthPlans.push(newGrowthPlan);
        }

    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.originGrowth == null) {
            return;
        }
        this.treeGrowthPlanning();
    }
}


export class MagnoliaTreeSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "MagnoliaTreeSeedOrganism";
    }

    getSproutType() {
        return MagnoliaTree;
    }
    getSproutTypeProto() {
        return "MagnoliaTreeOrganism";
    }
}