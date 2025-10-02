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

    _treeGrowthPlanning(growthPlan) {
        if (growthPlan.steps.length < 5) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                () => this.growGreenSquareAction(growthPlan.component.lifeSquares.at(0), SUBTYPE_STEM)
            ));
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