import { randNumber, randNumberExclusive, randRange, randSide } from "../../../common.js";
import { GenericRootSquare } from "../../../lifeSquares/GenericRootSquare.js";
import { STAGE_ADULT, STAGE_DEAD, STAGE_FLOWER, STAGE_JUVENILE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_LEAF, TYPE_STEM } from "../../Stages.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { BaseOrganism } from "../../BaseOrganism.js";
import { PalmTreeGreenSquare } from "../../../lifeSquares/trees/PalmTreeGreenSquare.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { UI_ORGANISM_TREE_MAGNOLIA } from "../../../ui/UIData.js";

export class MagnoliaTreeOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "MagnoliaTreeOrganism";
        this.uiRef = UI_ORGANISM_TREE_MAGNOLIA;
        this.greenType = PalmTreeGreenSquare;
        this.rootType = GenericRootSquare;
        this.growthCycleLength = 10 ** 8;
    }

    treeGrowthPlanning() {
        this.frameTreeGrowthChoices = new Array();
        this._treeGrowthPlanning(this.originGrowth.growthPlan, 0);
        this.executeFrameTreeGrowthChoice();
    }

    _treeGrowthPlanning(growthPlan, depth, startNode) {
        if (growthPlan.type == TYPE_LEAF)
            return;

        const maxDepth = 6;
        if (depth > maxDepth) {
            return;
        }

        let cls = this.originGrowth.getCountLifeSquaresOfType(TYPE_STEM);
        let maxComponentLength = Math.max(2 + 1 * (maxDepth - depth), cls ** 0.4);
        let maxNodes = growthPlan.component.lifeSquares.length / 4;
        let maxCcls = 64;

        growthPlan.component.lifeSquares.forEach((lsq) => {
            lsq.width = .4 + .4 * (growthPlan.component.getCountChildLifeSquaresOfType(TYPE_STEM) + (growthPlan.component.lifeSquares.length - growthPlan.component.lifeSquares.indexOf(lsq))) / maxCcls;
            let childComponent = growthPlan.component.children.find((child) => child.posX == lsq.posX && child.posY == lsq.posY);
            if (childComponent != null && childComponent.lifeSquares.length > 1) {
                childComponent.lifeSquares.at(0).height = .7;
            }
        });

        if (growthPlan.steps.length < maxComponentLength) {
            let growAction = () => {
                growthPlan.steps.push(new GrowthPlanStep(
                    growthPlan,
                    () => this.growGreenSquareAction((startNode ?? growthPlan.component.lifeSquares.at(randNumberExclusive(0, growthPlan.component.lifeSquares.length))), SUBTYPE_STEM)
                ))
            };
            if (startNode != null)
                growAction();
            else
                this.frameTreeGrowthChoices.push(["GROW", this._d(growthPlan.posX, growthPlan.posY), growAction]);
        }

        if (growthPlan.component.getChildrenOfType(TYPE_STEM).length < maxNodes && cls < maxCcls) {
            let childYs = growthPlan.component.children.map((child) => child.growthPlan.posY);
            let availableNodes = Array.from(growthPlan.component.lifeSquares
                .filter((lsq) => lsq.type == "green")
                .filter((lsq) => !childYs.some((childY) => childY == lsq.posY)));

            if (availableNodes.length > 2) {
                let startNode = availableNodes.at(randNumberExclusive(1, availableNodes.length));
                this.frameTreeGrowthChoices.push(["NEW", this._d(startNode.getPosX(), startNode.getPosY()), () => {
                    let newGrowthPlan = new GrowthPlan(
                        startNode.posX, startNode.posY,
                        false, STAGE_ADULT,
                        randRange(0, 2 * Math.PI), 0, 0, randSide() * randRange(0, 3 - growthPlan.component.getSumBaseDeflection()),
                        randRange(0, .3), TYPE_STEM, 10);

                    newGrowthPlan.postConstruct = () => {
                        growthPlan.component.addChild(newGrowthPlan.component);
                    };
                    this._treeGrowthPlanning(newGrowthPlan, depth + 1, startNode);
                    this.growthPlans.push(newGrowthPlan);
                }]);
            }
        }
        growthPlan.component.lifeSquares.forEach((lsq) => this.growLeaves(growthPlan, lsq));
        growthPlan.component.children.forEach((child) => this._treeGrowthPlanning(child.growthPlan, depth + 1));
    }

    growLeaves(growthPlan, startNode) {
        if (growthPlan.component.getChildrenOfType(TYPE_LEAF).length > 4) {
            return;
        }
        let leafGrowthPlan = new GrowthPlan(
            startNode.posX, startNode.posY,
            false, STAGE_ADULT,
            randRange(0, 2 * Math.PI), 0, 0, 7,
            4, TYPE_LEAF, 10);

        leafGrowthPlan.postConstruct = () => {
            growthPlan.component.addChild(leafGrowthPlan.component);
        };

        for (let i = 0; i < 2; i++) {
            leafGrowthPlan.steps.push(new GrowthPlanStep(
                leafGrowthPlan,
                () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, 1.3)
            ));
        }
        this.growthPlans.push(leafGrowthPlan);
    }



    _d(x, y) {
        return ((this.posX - x) ** 2 + (this.posY - y) ** 2) ** 0.5;
    }

    executeFrameTreeGrowthChoice() {
        if (this.frameTreeGrowthChoices.length == 0)
            return;
        this.frameTreeGrowthChoices.sort((a, b) => a[1] - b[1]);
        let newAction = this.frameTreeGrowthChoices.find((act) => act[0] == "NEW");
        if (newAction != null)
            newAction[2]();
        else
            this.frameTreeGrowthChoices.at(0)[2]();
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


export class MagnoliaTreeOrganismSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "MagnoliaTreeOrganismSeedOrganism";
    }

    getSproutType() {
        return MagnoliaTreeOrganism;
    }
    getSproutTypeProto() {
        return "MagnoliaTreeOrganism";
    }
}