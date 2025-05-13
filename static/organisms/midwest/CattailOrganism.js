import { randNumber, randRange, removeItemAll } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE, TYPE_FLOWER, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_TRUNK, TYPE_STEM, SUBTYPE_FLOWERTIP, STAGE_DEAD } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { CattailGreenSquare } from "../../lifeSquares/parameterized/midwest/CattailGreenSquare.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { addNewOrganism } from "../_orgOperations.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";

export class CattailOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "CattailOrganism";
        this.greenType = CattailGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays = 0.01;

        this.targetNumGrass = 1;
        this.maxNumGrass = 3;

        this.targetGrassLength = 3;
        this.maxGrassLength = 14;

        this.numGrowthCycles = 1; 
        this.growthCycleMaturityLength = 1 + (Math.random());
        this.growthCycleLength = this.growthCycleMaturityLength * 6;

        this.waterPressureSoilTarget = -2.2
        this.grasses = [];
    }

    spawnSeed() {
        if (this.originGrowth == null) 
            return;
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 4));
        if (seedSquare) {
            seedSquare.speedY = -Math.round(randRange(-2, -5));
            seedSquare.speedX = Math.round(randRange(-5, 5));
            let orgAdded = addNewOrganism(new CattailSeedOrganism(seedSquare, this.getNextGenetics()));
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.lifeSquares.at(0), orgAdded.lifeSquares.at(0));
            }
        }
        let reduction = 0.5;
        this.nitrogen *= (1 - reduction);
        this.phosphorus *= (1 - reduction);
        this.lightlevel *= (1 - reduction);
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = .1 + .3 * p0;

        this.maxNumGrass = randNumber(2, 3);
        this.maxGrassLength = 5 + Math.floor(this.maxGrassLength * p0);
        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen / 4;
    }

    executeGrowthPlans() {
        super.executeGrowthPlans();
        if (this.originGrowth != null) {
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                grass.lifeSquares.forEach((lsq) => {
                    if (lsq.subtype == SUBTYPE_STEM) {
                        lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length);
                    } else {
                        if (lsq.subtype == SUBTYPE_FLOWERTIP) {
                            lsq.width = 0.8;
                        } else {
                            let cur = Math.min(
                                this.nitrogen / this.growthNitrogen, 
                                    this.phosphorus / this.growthPhosphorus, 
                                    this.lightlevel / this.growthLightLevel);
                            if (cur < 0.5) {
                                lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length);
                            } else {
                                lsq.width = Math.max(lsq.width, .3 + .3 * Math.log(1 + grass.lifeSquares.length) + (cur - 0.5) * 0.4);
                            }
                        }
                    }
                });
            });

            if (this.grasses.length >= 2) {
                let grass = this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath)).at(1);
                let glsq = grass.lifeSquares;
                if (glsq.length < 5) {
                    return;
                }
                let min = glsq.length - 5;
                let max = glsq.length - 1;
                for (let i = 0; i < glsq.length; i++) {
                    if (i < min)
                        glsq[i].subtype = SUBTYPE_STEM;
                    else if (i < max - 1)
                        glsq[i].subtype = SUBTYPE_FLOWER;
                    else 
                        glsq[i].subtype = SUBTYPE_FLOWERTIP;
                }
            }
        }
    }

    growGrass() {
        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let baseDeflection = randRange(0, .1);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.15), TYPE_TRUNK, .7);
        growthPlan.postConstruct = () => {
            if (growthPlan.component.lifeSquares.length > 0) {
                this.originGrowth.addChild(growthPlan.component);
                this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
                growthPlan.component.xOffset = 3 * (Math.random() - 0.5);
                growthPlan.component.yOffset = - (.5 * (0.5 + Math.random()));
            }
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let shoot = this.growPlantSquare(startRootNode, 0, 0);
                shoot.subtype = SUBTYPE_STEM;
                return shoot;
            }
        ));
        this.growthPlans.push(growthPlan);
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                let startNode = grass.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_STEM);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != grass.growthPlan));
                    this.grasses = Array.from(this.grasses.filter((le) => this.originGrowth.getChildFromPath(le) != grass));
                    return;
                }
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => {
                            let newGrassNode = this.growPlantSquare(startNode, 0, 0);
                            newGrassNode.subtype = SUBTYPE_STEM;
                            return newGrassNode;
                        }
                    ))
                };
            });
    }

    planGrowth() {
        super.planGrowth();
        if (this.originGrowth == null) {
            return;
        }

        if (this.growthPlans.some((gp) => !gp.areStepsCompleted())) {
            this.executeGrowthPlans();
            return;
        }

        if (this.grasses.length < this.targetNumGrass) {
            this.growGrass();
            return;
        }

        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.targetNumGrass < this.maxNumGrass) {
            this.targetNumGrass += 1;
            return;
        }
        if (this.targetGrassLength < this.maxGrassLength) {
            this.targetGrassLength += 1;
            return;
        }
    }
}

export class CattailSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "CattailSeedOrganism";
    }

    getSproutType() {
        return CattailOrganism;
    }
}