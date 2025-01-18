import { randNumber, randRange } from "../../../common.js";
import { PalmTreeGreenSquare } from "../../../lifeSquares/parameterized/woodland/PalmTreeGreenSquare.js";
import { PalmTreeRootSquare } from "../../../lifeSquares/parameterized/woodland/PalmTreeRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_TRUNK, SUBTYPE_TRUNK_CORE, TYPE_LEAF, TYPE_TRUNK } from "../Stages.js";

export class PalmTreeOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = PalmTreeGreenSquare;
        this.rootType = PalmTreeRootSquare;

        this.trunkMaxThickness = 5;
        this.trunkCurThickness = 1;

        this.airCoef = 0.01;
        this.waterCoef = 0.01;
        this.dirtCoef = 0.001;
        this.reproductionEnergy = 10 ** 8;
        this.currentHealth = 10 ** 8;

        /* 
        the palm tree rules
        ------------------- 

        each node can only grow so many fronds (fraction of number of life squares in trunk)
        to grow some height, you must be at least height/n wide
        to grow a leaf of some length, you must be some fraction of that leaf length tall 
        as more height is added at the top, if there already 2 or more nodes, the "middle" node gets moved to the side (with all its children) and the new node goes in the middle
        to grow some width, you must be anchored at the bottom to a SUBTYPE_ROOTNODE root 
        roots may be promoted to SUBTYPE_ROOTNODE 
        */
    }

    gp_juvenile() {
        if (!(STAGE_JUVENILE in this.stageGrowthPlans)) {
            this.stageGrowthPlans[STAGE_JUVENILE] = new Array();
        }
        if (this.stageGrowthPlans[STAGE_JUVENILE].length > 0) {
            return null;
        }

        var startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        var growthPlan = new GrowthPlan(startRootNode.posX, startRootNode.posY, false, STAGE_ADULT, randRange(0, 1) - 1, Math.random() / 3, TYPE_TRUNK);
        growthPlan.postConstruct = () => this.originGrowth.addChild(growthPlan.component);
        for (let t = 1; t < randNumber(5, 10); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startRootNode, 0, t);
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
                var node = this.growPlantSquare(startRootNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            }
        ))

        this.stageGrowthPlans[STAGE_JUVENILE].push(growthPlan);
        return growthPlan;
    }

    adultGrowthPlanning() {
        var trunk = this.getAllComponentsofType(TYPE_TRUNK).at(0);

        var maxLeaves = 1 + Math.floor(trunk.lifeSquares.map((lsq) => lsq.subtype == SUBTYPE_NODE ? 3 : 0.1).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ));

        var maxHeight = trunk.xSize() * 2;

        var maxLeafLength = Math.ceil(trunk.ySize());

        // try to grow additional leaves if we can 

        var curLeaves = trunk.children.length;
        if (curLeaves < maxLeaves) {
            this.growthPlans.push(this.newLeafGrowthPlan(trunk, maxLeafLength));
            return;
        }

        // then try to extend our leaves 

        if (this.getAllComponentsofType(TYPE_LEAF).some((growthPlan) => this.extendLeafGrowthPlan(growthPlan, maxLeafLength))) {
            return;
        }

        // then try to increase our height 

        if (trunk.ySize() < maxHeight) {
            this.increaseHeightGrowthPlan(trunk);
            return;
        }

        // then thicken our trunk

        this.thickenTrunkGrowthPlan(trunk);

        // then, uh, i don't fucking know 
    }

    newLeafGrowthPlan(startComponent, maxLeafLength) {
        // grow from the node with the least child lifesquares
        var startNode;

        startComponent.lifeSquares.filter((lsq) => lsq.subtype == SUBTYPE_NODE).forEach((lsq) => {
            if (startNode == null || lsq.childLifeSquares.length < startNode.childLifeSquares.length) {
                startNode = lsq;
            }
        })
        var growthPlan = new GrowthPlan(startNode.posX, startNode.posY, false, STAGE_ADULT, 0.5 + randRange(0, 1) - 1, Math.random() / 3, TYPE_LEAF);
        growthPlan.postConstruct = () => startComponent.addChild(growthPlan.component);
        for (let t = 1; t < randNumber(0, maxLeafLength); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                0.001,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var shoot = this.growPlantSquare(startNode, 0, t);
                    shoot.subtype = SUBTYPE_LEAF;
                    return shoot;
                }
            ))
        }
        return growthPlan;
    }

    extendLeafGrowthPlan(leafComponent, maxLeafLength) {
        if (leafComponent.growthPlan.steps.length < maxLeafLength) {
            for (let t = leafComponent.growthPlan.steps.length; t < maxLeafLength; t++) {
                leafComponent.growthPlan.completed = false;
                leafComponent.growthPlan.steps.push(new GrowthPlanStep(
                    leafComponent.growthPlan,
                    0,
                    0.001,
                    () => this.plantLastGrown,
                    (time) => this.plantLastGrown = time,
                    () => {
                        var shoot = this.growPlantSquare(leafComponent.lifeSquares.at(0), 0, 0);
                        shoot.subtype = SUBTYPE_LEAF;
                        return shoot;
                    }
                ))
            }
            return true;
        }
        return false;
    }

    increaseHeightGrowthPlan(trunk) {
        var xPositions = trunk.xPositions();
        var trunkMinY = Math.min(...trunk.yPositions());
        var trunkMaxX = Math.max(...trunk.xPositions());

        xPositions.forEach((posX) => {
            var rootNodeSq = this.lifeSquares.find((lsq) => lsq.type == "root" && lsq.posX == posX && lsq.posX <= trunkMaxX + 1);
            if (rootNodeSq == null) {
                return;
            }
            var curY = rootNodeSq.posY - 1;
            while (curY > trunkMinY) {
                trunk.growthPlan.completed = false;
                trunk.growthPlan.steps.push(new GrowthPlanStep(
                    trunk.growthPlan,
                    0,
                    0,
                    () => this.plantLastGrown,
                    (time) => this.plantLastGrown = time,
                    () => {
                        var node = this.growPlantSquarePos(rootNodeSq, posX, rootNodeSq.posY - 3);
                        node.subtype = SUBTYPE_TRUNK;
                        return node;
                    }
                ));
                curY -= 1;
            }
        })
    }

    thickenTrunkGrowthPlan(trunk) {
        // the growth plan coming out of this needs to be fast (0 time)
        var nextX = (this.trunkCurThickness % 2 > 0 ? -1 : 1) * Math.ceil(this.trunkCurThickness / 2);
        var trunkMinY = Math.min(...trunk.yPositions());
        var trunkMaxX = Math.max(...trunk.xPositions());

        var rootNodeSq = this.lifeSquares.find((lsq) => lsq.type == "root" && lsq.posX == trunk.posX + nextX && lsq.posX <= trunkMaxX + 1);
        if (rootNodeSq == null) {
            return;
        }
        rootNodeSq.subtype = SUBTYPE_ROOTNODE;
        trunk.growthPlan.completed = false;
        var curY = rootNodeSq.posY - 1;
        while (curY > trunkMinY) {
            trunk.growthPlan.steps.push(new GrowthPlanStep(
                trunk.growthPlan,
                0,
                0,
                () => this.plantLastGrown,
                (time) => this.plantLastGrown = time,
                () => {
                    var node = this.growPlantSquarePos(rootNodeSq, rootNodeSq.posX, rootNodeSq.posY - 1);
                    node.subtype = SUBTYPE_TRUNK;
                    return node;
                }
            ));
            curY -= 1;
        };
        this.trunkCurThickness += 1;
    }

    planGrowth() {
        if (this.stage == STAGE_JUVENILE) {
            var plan = this.gp_juvenile();
            if (plan != null)
                this.growthPlans.push(plan);
        }
        if (this.stage == STAGE_ADULT) {
            this.adultGrowthPlanning();
        }
    }
}