import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { ElephantEarGreenSquare } from "../../lifeSquares/parameterized/tropical/ElephantEarGreenSquare.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_STEM, SUBTYPE_TRUNK, TYPE_LEAF, TYPE_TRUNK } from "../Stages.js";

export class ElephantEarOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "ElephantEarOrganism";
        this.greenType = ElephantEarGreenSquare;
        this.rootType = GenericParameterizedRootSquare;

        this.maxNumLeaves = 3;
        this.curNumLeaves = 1;

        this.airCoef = 0.01;
        this.waterCoef = 0.01;
        this.dirtCoef = 0.001;
        this.reproductionEnergy = 10 ** 8;
        this.currentHealth = 10 ** 8;
        
        this.sproutGrowTimeInDays =  10 ** (-2.9);
        this.leafGrowTimeInDays =    10 ** (-2.9);
        this.trunkGrowTimeInDays =   10 ** (-2.9);

        this.side = Math.random() > 0.5 ? -1 : 1;
        this.minAngle = -Math.PI * 0.5;
        this.maxAngle = Math.PI * 0.5;
        this.spinnable = true;
    }

    getLeafLocations(xSize, ySize) {
        let locs = new Array();
        let step = 0.01;
        let yIntercept = 0.7;
        for (let x = -2; x < 2; x += step) {
            for (let y = 0; y < 5; y += step) {
                let elipseVal = (1.8 * x) ** 2 + (y ** 0.6 - 1) ** 2; 
                let triangleVal = -Math.abs(2*x) + yIntercept;
                if (elipseVal <= 2 && y >= triangleVal) {
                    locs.push([x, y]);
                }
            }
        }

        let maxX = Math.max(...locs.map((loc) => loc[0]));
        let maxY = Math.max(...locs.map((loc) => loc[1]));

        let out = new Array();
        for (let i = 0; i <= xSize; i++) {
            for (let j = 0; j < ySize; j++) {
                let ip = (i / xSize) * maxX;
                let jp = (j / ySize) * maxY;
                let minDist = Math.min(...locs.map((loc) => ((loc[0] - ip) ** 2 + (loc[1] - jp) ** 2) ** 0.5));
                if (minDist < step * Math.SQRT2) {
                    out.push([i, j]);
                    if (i != 0) 
                        out.push([-i, j]);
                }
            }
        }
        return out;
    }

    getNextDeflection() {
        return randRange(this.minAngle, this.maxAngle);
    }
    getNextTheta() {
        return randRange(-Math.PI, Math.PI);
    }

    juvenileGrowthPlanning() {
        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        this.growLeafAndStemFromNode(startRootNode, 
            this.getNextDeflection(),
            this.getNextTheta(),
            randNumber(10, 15),
            randNumber(4, 6),
            randNumber(10, 15)
        );
    }

    growLeafFromNode(stemLeafNode, xSize, ySize, twist) {
        let leafGrowthPlan = new GrowthPlan(
            stemLeafNode.posX, stemLeafNode.posY, 
            false, STAGE_ADULT, 
            twist, twist, 0, 0,0,
            TYPE_LEAF, 0.15);

        leafGrowthPlan.setBaseRotationOverTime([
            [0, 0],
            [0.1, Math.PI * 0.3]
        ]);

        leafGrowthPlan.postConstruct = () => stemLeafNode.component.addChild(leafGrowthPlan.component);
        let leafLocations = this.getLeafLocations(xSize, ySize);
        for (let t = 0; t < Math.min(...leafLocations.filter((loc) => loc[0] == 0).map((loc) => loc[1])); t++) {
            let step = new GrowthPlanStep(
                leafGrowthPlan,
                0,
                this.leafGrowTimeInDays,
                () => {
                    let shoot = this.growPlantSquare(stemLeafNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            );
            step.distToCenter = t;
            leafGrowthPlan.steps.push(step);
        };
        
        leafLocations.forEach((loc) => {
            let step = new GrowthPlanStep(
                leafGrowthPlan,
                0,
                this.leafGrowTimeInDays,
                () => {
                    let shoot = this.growPlantSquare(stemLeafNode, loc[0], loc[1]);
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
        let nextX = (this.curNumLeaves % 2 > 0 ? this.side : this.side * -1) * Math.ceil(this.curNumLeaves / 2);
        let originGrowthY = Math.max(...this.originGrowth.yPositions());
        let rootNodeSq = this.lifeSquares.find((lsq) => lsq.type == "root" && lsq.posX == this.originGrowth.posX + nextX && lsq.posY <= originGrowthY);
        if (rootNodeSq == null) {
            this.side *= -1;
            return;
        }
        rootNodeSq.subtype = SUBTYPE_ROOTNODE;
        rootNodeSq.component = this.originGrowth;
        let newGrowthPlan = this.growLeafAndStemFromNode(rootNodeSq,
            this.getNextDeflection(),
            this.getNextTheta(),
            randNumber(13, 18),
            randNumber(4, 6),
            randNumber(12, 18)
        );

        
        this.originGrowth.addLifeSquare(rootNodeSq);
        this.originGrowth.addChild(newGrowthPlan.component);
    }

    growLeafAndStemFromNode(startNode, deflection, theta, stemLength, leafXSize, leafYSize) {
        let growthPlan = new GrowthPlan(
            startNode.posX, startNode.posY, 
            false, STAGE_ADULT, 
            theta, 0, 0, deflection / 2,deflection / 2, 
            TYPE_TRUNK, 5);
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
        let leafNode = null;
        for (let t = 1; t < stemLength; t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.sproutGrowTimeInDays,
                () => {
                    let shoot = this.growPlantSquare(startNode, 0, 1);
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

export class ElephantEarSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "ElephantEarSeedOrganism";
    }
    getSproutType() {
        return ElephantEarOrganism;
    }
}