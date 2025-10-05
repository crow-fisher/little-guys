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
        this._treeGrowthPlanning(this.originGrowth.growthPlan, 0);
        this.executeFrameTreeGrowthChoice();
    }

    _treeGrowthPlanning(growthPlan, depth, startNode) {
        const maxDepth = 4;
        if (depth > maxDepth) {
            return;
        }

        let ccls = growthPlan.component.getCountChildLifeSquares();
        let maxComponentLength = Math.max(3 * (maxDepth - depth), ccls ** 0.7);
        let maxNodes = Math.max(1, ccls ** 0.1)

        let maxCcls = 100;
        
        if (ccls > maxCcls)
            return;

        let componentWidth = .6 + .4 * ccls / maxCcls;

        growthPlan.component.lifeSquares.forEach((lsq) => lsq.width = componentWidth);

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
                this.frameTreeGrowthChoices.push([this._d(growthPlan.posX, growthPlan.posY), growAction]);
        }
        if (growthPlan.component.children.length < maxNodes) {
            // grow new child
            // find where our children currently are
            let childYs = growthPlan.component.children.map((child) => child.growthPlan.posY);
            let availableNodes = Array.from(growthPlan.component.lifeSquares
                .filter((lsq) => lsq.type == "green")
                .filter((lsq) => !childYs.some((childY) => childY == lsq.posY)));

            if (availableNodes.length <= 4)
                return;

            let startNode = availableNodes.at(randNumberExclusive(3, availableNodes.length));

            this.frameTreeGrowthChoices.push([this._d( startNode.getPosX(), startNode.getPosY()), () => {
                let newGrowthPlan = new GrowthPlan(
                    startNode.posX, startNode.posY,
                    false, STAGE_ADULT,
                    randRange(0, 2 * Math.PI), 0, 0, randRange(.7, 1.2),
                    randRange(0, .3), TYPE_STEM, 10);

                newGrowthPlan.postConstruct = () => {
                    growthPlan.component.addChild(newGrowthPlan.component);
                };
                this._treeGrowthPlanning(newGrowthPlan, depth + 1, startNode);
                this.growthPlans.push(newGrowthPlan);
            }]);
        }
        growthPlan.component.children.forEach((child) => this._treeGrowthPlanning(child.growthPlan, depth + 1));
    }

    _d(x, y) {
        return ((this.posX - x) ** 2 + (this.posY - y) ** 2) ** 0.5;
    }

    executeFrameTreeGrowthChoice() {
        this.frameTreeGrowthChoices.sort((a, b) => a[0] - b[0]);
        console.log(this.frameTreeGrowthChoices);
        if (this.frameTreeGrowthChoices.length > 0) {
            this.frameTreeGrowthChoices.at(0)[1]()
            // this.frameTreeGrowthChoices.at(randNumberExclusive(0, this.frameTreeGrowthChoices.length / 3))[1]();
        }
            // this.frameTreeGrowthChoices.at(randNumberExclusive(0, this.frameTreeGrowthChoices.length / 3))[1]();
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