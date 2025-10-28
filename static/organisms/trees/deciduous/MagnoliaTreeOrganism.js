import { randNumberExclusive, randRange, randSide } from "../../../common.js";
import { GenericRootSquare } from "../../../lifeSquares/GenericRootSquare.js";
import { STAGE_ADULT, SUBTYPE_LEAF, SUBTYPE_STEM, TYPE_LEAF, TYPE_STEM } from "../../Stages.js";
import { GrowthPlan, GrowthPlanStep } from "../../GrowthPlan.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { BaseOrganism } from "../../BaseOrganism.js";
import { UI_ORGANISM_TREE_MAGNOLIA } from "../../../ui/UIData.js";
import { MagnoliaTreeOrganismGreenSquare } from "../../../lifeSquares/trees/deciduous/MagnoliaTreeGreenSquare.js";
import { getBaseSize, zoomCanvasSquareText } from "../../../canvas.js";

export class MagnoliaTreeOrganism extends BaseOrganism {
    constructor(square) {
        super(square);
        this.proto = "MagnoliaTreeOrganism";
        this.uiRef = UI_ORGANISM_TREE_MAGNOLIA;
        this.greenType = MagnoliaTreeOrganismGreenSquare;
        this.rootType = GenericRootSquare;
        this.growthCycleLength = 10 ** 8;
    }

    treeGrowthPlanning() {
        this.frameTreeGrowthChoices = new Array();
        this._treeGrowthPlanning(this.originGrowth.growthPlan, 0);
        this.treeWidthRoutine();
        this.executeFrameTreeGrowthChoice();
    }
    
    render() {
        super.render();
        //     this.lifeSquares.forEach((lsq) => {
        //     if (lsq.depth != null)
        //         lsq.width = .1 + lsq.depth / 4; 
        //     zoomCanvasSquareText(lsq.getPosX() * getBaseSize(), lsq.getPosY() * getBaseSize(), lsq.depth);
        // });
    }

    treeWidthRoutine() {
        // we need to determine how many children each life square has
        this._treeWidthCountRoutine(this.originGrowth);

        this.lifeSquares.forEach((lsq) => {
            if (lsq.depth != null)
                lsq.width = .3 + lsq.depth / 70; 
        });

    }
    _treeWidthCountRoutine(component) {
        let lsqs = component.lifeSquares;
        let max = 0;
        for (let i = 0; i < lsqs.length; i++) {
            let lsq = lsqs.at(i);
            let lsqChildren = Array.from(component.children.filter((child) => child.type == TYPE_STEM && child.posY == lsq.posY));
            lsq.depth = (lsqs.length - i);
            let componentDepth = lsqChildren.map((child) => this._treeWidthCountRoutine(child)).reduce((a, b) => a + b, 0);
            lsqs.slice(0, i).forEach((lsq) => lsq.depth += componentDepth);
            lsq.depth += componentDepth;

            max = Math.max(lsq.depth, max);
        }
        return max;
    }

    _treeGrowthPlanning(growthPlan, depth, startNode) {
        if (growthPlan.type == TYPE_LEAF) {
            return;
        }

        const maxDepth = 6;
        if (depth > maxDepth) {
            return;
        }

        let cls = this.originGrowth.getCountLifeSquaresOfType(TYPE_STEM);
        let maxComponentLength = Math.max(2 + 1 * (maxDepth - depth), cls ** 0.4);
        let maxNodes = growthPlan.component.lifeSquares.length / 4;
        let maxCcls = 4;
        
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
                        randRange(0, .3), 0, TYPE_STEM, 10);

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
            4, 0, TYPE_LEAF, 10);

        leafGrowthPlan.postConstruct = () => {
            growthPlan.component.addChild(leafGrowthPlan.component);
        };

        for (let i = 0; i < 2; i++) {
            leafGrowthPlan.steps.push(new GrowthPlanStep(
                leafGrowthPlan,
                () => this.growGreenSquareAction(startNode, SUBTYPE_LEAF, 1.3, randRange(0.55, 0.65))
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