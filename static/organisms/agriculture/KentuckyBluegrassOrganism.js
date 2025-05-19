import { randNumber, randRange } from "../../common.js";
import { GenericParameterizedRootSquare } from "../../lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { STAGE_ADULT, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_STEM, TYPE_TRUNK } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { KentuckyBluegrassGreenSquare } from "../../lifeSquares/parameterized/agriculture/grasses/KentuckyBluegrassGreenSquare.js";
import { addSquare } from "../../squares/_sqOperations.js";
import { SeedSquare } from "../../squares/SeedSquare.js";
import { addNewOrganism } from "../_orgOperations.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";

export class KentuckyBluegrassOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "KentuckyBluegrassOrganism";
        this.greenType = KentuckyBluegrassGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;

        this.targetNumGrass = 1;
        this.maxNumGrass = 2;

        this.targetGrassLength = 1;
        this.maxGrassLength = 5;

        this.numGrowthCycles = 1; 
        this.growthCycleMaturityLength = 12 + 7 * (Math.random());
        this.growthCycleLength = this.growthCycleMaturityLength * 2.65;

        this.grasses = [];

        this.llt_throttlValMin = 1;
        this.llt_throttlValMax = 2;
        
    }

    spawnSeed() {
        if (this.originGrowth == null || (this.growthPlans.some((gp) => !gp.areStepsCompleted())) || this.targetGrassLength != this.maxGrassLength) 
            return;
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);
        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 4));
        if (seedSquare) {
            seedSquare.speedY = -Math.round(randRange(-2, -5));
            seedSquare.speedX = Math.round(randRange(-5, 5));
            let orgAdded = addNewOrganism(new KentuckyBluegrassSeedOrganism(seedSquare, this.getNextGenetics()));
            if (!orgAdded) {
                seedSquare.destroy();
            } else {
                applyLightingFromSource(this.lifeSquares.at(0), orgAdded.lifeSquares.at(0));
            }
        }
        let reduction = 0.9;
        this.nitrogen *= (1 - reduction);
        this.phosphorus *= (1 - reduction);
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = this.evolutionParameters[0];
        this.growthLightLevel = 0.1 + 1 * p0;

        this.maxNumGrass = 1 + Math.floor(this.maxNumGrass * p0);
        this.maxGrassLength = 1 + Math.floor(this.maxGrassLength * p0);

        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen / 4;
    }

    doGreenGrowth() {
        super.doGreenGrowth();
        if (this.originGrowth != null) {
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                grass.lifeSquares.forEach((lsq) => lsq.width = .3 + .3 * Math.log(1 + grass.lifeSquares.length));

            })
        }
    }

    growGrass() {
        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let baseDeflection = randRange(0, .1);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.3), TYPE_TRUNK, .4, 15);
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
            growthPlan.component.xOffset = 3 * (Math.random() - 0.5);
            growthPlan.component.yOffset = - (.5 * (0.5 + Math.random()));
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startRootNode, SUBTYPE_STEM)
        ))
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
                    this.leaves = Array.from(this.leaves.filter((le) => this.originGrowth.getChildFromPath(le) != grass));
                    return;
                }
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_STEM)
                    ))
                };
            });
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.originGrowth == null) {
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

export class KentuckyBluegrassSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "KentuckyBluegrassSeedOrganism";
    }

    getSproutType() {
        return KentuckyBluegrassOrganism;
    }
}