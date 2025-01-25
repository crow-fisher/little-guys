import { randNumber, randRange } from "../../../common.js";
import { getGlobalThetaBase } from "../../../index.js";
import { ElephantEarGreenSquare } from "../../../lifeSquares/parameterized/tropical/ElephantEarGreenSquare.js";
import { ElephantEarRootSquare } from "../../../lifeSquares/parameterized/tropical/ElephantEarRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_LEAF, TYPE_TRUNK } from "../Stages.js";

export class ElephantEarOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = ElephantEarGreenSquare;
        this.rootType = ElephantEarRootSquare;

        this.maxNumLeaves = 3;
        this.curNumLeaves = 1;

        this.airCoef = 0.01;
        this.waterCoef = 0.01;
        this.dirtCoef = 0.001;
        this.reproductionEnergy = 10 ** 8;
        this.currentHealth = 10 ** 8;
        
        this.sproutGrowTimeInDays =  10 ** (-3.3);
        this.leafGrowTimeInDays =    10 ** (-3.3);
        this.trunkGrowTimeInDays =   10 ** (-3.3);

        this.side = Math.random() > 0.5 ? -1 : 1;

        // parameterized growth rules

        /* 
        the elephant ear rules
        ---------------------- 

        grow a curved stem with a big ol leaf at the end of it at some angle
        
        */
    }

    getLeafLocations(xSize, ySize) {
        var locs = new Array();
        var step = 0.01;
        var yIntercept = 0.7;
        for (let x = -2; x < 2; x += step) {
            for (let y = 0; y < 5; y += step) {
                var elipseVal = (1.8 * x) ** 2 + (y ** 0.6 - 1) ** 2; 
                var triangleVal = -Math.abs(2*x) + yIntercept;
                if (elipseVal <= 2 && y >= triangleVal) {
                    locs.push([x, y]);
                }
            }
        }

        var maxX = Math.max(...locs.map((loc) => loc[0]));
        var maxY = Math.max(...locs.map((loc) => loc[1]));

        var out = new Array();
        for (let i = 0; i <= xSize; i++) {
            for (let j = 0; j < ySize; j++) {
                var ip = (i / xSize) * maxX;
                var jp = (j / ySize) * maxY;
                var minDist = Math.min(...locs.map((loc) => ((loc[0] - ip) ** 2 + (loc[1] - jp) ** 2) ** 0.5));
                if (minDist < step * Math.SQRT2) {
                    out.push([i, j]);
                    if (i != 0) 
                        out.push([-i, j]);
                }
            }
        }
        return out;
    }

    leafGrowthPlanAtAngle(startLsq, xSize, ySize) {
        var growthPlan = new GrowthPlan(
            startLsq.posX, startLsq.posY, 
            false, STAGE_ADULT, 
            deflection, 0, 0, deflection,0,
            TYPE_LEAF, 1);
        growthPlan.postConstruct = () => startLsq.component.addChild(growthPlan.component);

        var newNode = null;
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.leafGrowTimeInDays,
            () => {
                newNode = this.growPlantSquare(startLsq, 0, 1);
                newNode.subtype = SUBTYPE_NODE;
                return newNode;
            },
            null
        ));
        this.growthPlans.push(growthPlan);
        growthPlan.postComplete = () => this.growLeafFromNode(newNode, xSize, ySize, deflection / 2);
    }
    
    juvenileGrowthPlanning() {
        var startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        this.growLeafAndStemFromNode(startRootNode, 
            randRange(-Math.PI * 0.2, Math.PI * 0.2),
            randNumber(10, 15),
            randNumber(4, 6),
            randNumber(10, 15)
        );
    }

    growLeafFromNode(stemLeafNode, xSize, ySize, twist) {
        var leafGrowthPlan = new GrowthPlan(
            stemLeafNode.posX, stemLeafNode.posY, 
            false, STAGE_ADULT, 
            twist, twist, 0, 0,0,
            TYPE_LEAF, 1);

        // leafGrowthPlan.setBaseRotationOverTime([
        //     [0, 0],
        //     [0.1, Math.PI * 0.3]
        // ]);

        leafGrowthPlan.postConstruct = () => stemLeafNode.component.addChild(leafGrowthPlan.component);
        var leafLocations = this.getLeafLocations(xSize, ySize);
        for (let t = 0; t < Math.min(...leafLocations.filter((loc) => loc[0] == 0).map((loc) => loc[1])); t++) {
            var step = new GrowthPlanStep(
                leafGrowthPlan,
                0,
                this.leafGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(stemLeafNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            );
            step.distToCenter = t;
            leafGrowthPlan.steps.push(step);
        };
        
        leafLocations.forEach((loc) => {
            var step = new GrowthPlanStep(
                leafGrowthPlan,
                0,
                this.leafGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(stemLeafNode, loc[0], loc[1]);
                    shoot.subtype = SUBTYPE_LEAF;
                    return shoot;
                },
                null
            ); 
            step.distToCenter = (loc[0] ** 4 + loc[1]) ** 0.5;
            leafGrowthPlan.steps.push(step);
        });
        leafGrowthPlan.steps.sort((a, b) => a.distToCenter - b.distToCenter);
        this.growthPlans.push(leafGrowthPlan);
    }

    addNewLeafGrowthPlan() {
        if (this.curNumLeaves >= this.maxNumLeaves) {
            return;
        }
        this.curNumLeaves += 1;
        var nextX = (this.curNumLeaves % 2 > 0 ? this.side : this.side * -1) * Math.ceil(this.curNumLeaves / 2);
        var originGrowthY = Math.max(...this.originGrowth.yPositions());
        var rootNodeSq = this.lifeSquares.find((lsq) => lsq.type == "root" && lsq.posX == this.originGrowth.posX + nextX && lsq.posY <= originGrowthY);
        if (rootNodeSq == null) {
            this.side *= -1;
            return;
        }
        rootNodeSq.subtype = SUBTYPE_ROOTNODE;
        rootNodeSq.component = this.originGrowth;
        var newGrowthPlan = this.growLeafAndStemFromNode(rootNodeSq,
            randRange(-Math.PI * 0.2, Math.PI * 0.2),
            randNumber(13, 18),
            randNumber(4, 6),
            randNumber(12, 18)
        );

        
        this.originGrowth.addLifeSquare(rootNodeSq);
        this.originGrowth.addChild(newGrowthPlan.component);
    }

    growLeafAndStemFromNode(startNode, deflection, stemLength, leafXSize, leafYSize) {
        var growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, 
            0, 0, 0, deflection / 2,deflection / 2, 
            TYPE_TRUNK, 3);
        growthPlan.postConstruct = () => startNode.component.addChild(growthPlan.component);

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.sproutGrowTimeInDays,
            () => {
                leafNode = this.growPlantSquare(startNode, 0, 1);
                leafNode.subtype = SUBTYPE_NODE;
                return leafNode;
            },
            () => this.growLeafFromNode(leafNode, leafXSize, leafYSize, deflection)
        ));
        var leafNode = null;
        for (let t = 1; t < stemLength; t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.sproutGrowTimeInDays,
                () => {
                    var shoot = this.growPlantSquare(startNode, 0, 1);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            ))
        }
        this.growthPlans.push(growthPlan);
        return growthPlan;
    }

    adultGrowthPlanning() {
        this.addNewLeafGrowthPlan();
    }

    planGrowth() {
        if (this.stage == STAGE_JUVENILE) {
            this.juvenileGrowthPlanning();
        }
        
        if (this.stage == STAGE_ADULT) {
            this.adultGrowthPlanning();
        }
    }
}