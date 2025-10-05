import { randNumber, randNumberExclusive, randRange } from "../../../common.js";
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

        this.frameTreeGrowthChoices = new Array();
        this._treeGrowthPlanning(this.originGrowth.growthPlan);
        this.executeFrameTreeGrowthChoice();
    }

    _treeGrowthPlanning(growthPlan, startNode) {
        let ccls = growthPlan.component.getCountChildLifeSquares();
        let maxComponentLength = Math.max(3, ccls ** 0.6);
        let maxNodes = Math.max(1, Math.min(maxComponentLength - 2, ccls ** 0.2))

        console.log("maxComponentLength", maxComponentLength, "maxNodes", maxNodes);

        if (growthPlan.steps.length < maxComponentLength) {
            let growAction = () => {
                growthPlan.steps.push(new GrowthPlanStep(
                    growthPlan,
                    () => this.growGreenSquareAction((startNode ?? growthPlan.component.lifeSquares.at(0)), SUBTYPE_STEM)
                ))};
            if (startNode != null) 
                growAction();
            else
                this.frameTreeGrowthChoices.push(growAction);
        }
        if (growthPlan.component.children.length < maxNodes) {
            // grow new child
            // find where our children currently are
            let childYs = growthPlan.component.children.map((child) => child.growthPlan.posY);
            let availableNodes = Array.from(growthPlan.component.lifeSquares
                .filter((lsq) => lsq.type == "green")
                .filter((lsq) => !childYs.some((childY) => childY == lsq.posY)));

            if (availableNodes.length == 0)
                return;

            let startNode = availableNodes.at(randNumberExclusive(0, availableNodes.length));

            this.frameTreeGrowthChoices.push(() => {
                let newGrowthPlan = new GrowthPlan(
                    startNode.posX, startNode.posY,
                    false, STAGE_ADULT,
                    randRange(0, Math.PI), 0, 0, randRange(-.6, .6),
                    0, TYPE_STEM, 10);

                newGrowthPlan.postConstruct = () => {
                    growthPlan.component.addChild(newGrowthPlan.component);
                };
                this._treeGrowthPlanning(newGrowthPlan, startNode);
                this.growthPlans.push(newGrowthPlan);
            })
        }
        growthPlan.component.children.forEach((child) => this._treeGrowthPlanning(child.growthPlan));


    }

    executeFrameTreeGrowthChoice() {
        if (this.frameTreeGrowthChoices.length > 0)
            this.frameTreeGrowthChoices.at(randNumberExclusive(0, this.frameTreeGrowthChoices.length))();
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