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
import { MushroomSeedOrganism } from "../fantasy/MushroomOrganism.js";
import { addNewOrganism } from "../_orgOperations.js";

export class KentuckyBluegrassOrganism extends BaseOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "KentuckyBluegrassOrganism";
        this.greenType = KentuckyBluegrassGreenSquare;
        this.rootType = GenericParameterizedRootSquare;
        this.grassGrowTimeInDays =  0.01;
        this.side = Math.random() > 0.5 ? -1 : 1;
        this.maxNumGrass = 24;
        this.curNumGrass = 0;
        this.grassLengthMin = 2;
        this.grassLengthMax = 8;
        this.numGrowthCycles = 1; 
        this.growthCycleMaturityLength = 1 + (Math.random());
        this.growthCycleLength = this.growthCycleMaturityLength * 2;
    }

    spawnSeed() {
        if (this.originGrowth == null) 
            return;
        
        let comp = this.originGrowth.children.at(randNumber(0, this.originGrowth.children.length - 1));
        let lsq = comp.lifeSquares.at(comp.lifeSquares.length - 1);

        let seedSquare = addSquare(new SeedSquare(lsq.getPosX(), lsq.getPosY() - 4));
        seedSquare.speedY = -Math.round(randRange(-2, -5));
        seedSquare.speedX = Math.round(randRange(-5, 5));

        if (seedSquare) {
            let orgAdded = addNewOrganism(new KentuckyBluegrassSeedOrganism(seedSquare, this.getNextGenetics()));
            if (!orgAdded) {
                seedSquare.destroy();
            }
        }
        let reduction = 0.8
        this.nitrogen *= (1 - reduction);
        this.phosphorus *= (1 - reduction);
        this.lightlevel *= (1 - reduction);
    }

    processGenetics() {
        this.evolutionParameters[0] = Math.min(Math.max(this.evolutionParameters[0], 0.00001), .99999)
        let p0 = .1 + this.evolutionParameters[0] * 0.9;
        this.growthLightLevel = .1 + p0 * 0.3;

        this.maxNumGrass = Math.floor(this.maxNumGrass * p0);
        this.grassLengthMax = Math.floor(this.grassLengthMax * p0);

        this.growthNumGreen = this.maxNumGrass * this.grassLengthMax;
        this.growthNumRoots = this.growthNumGreen / 4;
    }

    growGrass() {
        if (this.curNumGrass > this.maxNumGrass) {
            return;
        }
        this.curNumGrass += 1;

        let startRootNode = this.getOriginsForNewGrowth(SUBTYPE_ROOTNODE).at(0);
        let baseDeflection = randRange(0, .1);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 0, 
            baseDeflection, 
            randRange(0, 0.3), TYPE_TRUNK, 1);
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            growthPlan.component.xOffset = 4 * (Math.random() - 0.5);
            growthPlan.component.yOffset = - (4 * (0.5 + Math.random()));
        };
        growthPlan.component._getWilt = (val) => Math.sin(val) / 2; 
        for (let t = 1; t < randNumber(this.grassLengthMin, this.grassLengthMax); t++) {
            growthPlan.steps.push(new GrowthPlanStep(
                growthPlan,
                0,
                this.grassGrowTimeInDays,
                () => {
                    let shoot = this.growPlantSquare(startRootNode, 0, t);
                    shoot.subtype = SUBTYPE_STEM;
                    return shoot;
                },
                null
            ))
        }

        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            0,
            this.grassGrowTimeInDays,
            () => {
                let node = this.growPlantSquare(startRootNode, 0, growthPlan.steps.length);
                node.subtype = SUBTYPE_NODE;
                return node;
            },
            null
        ))
        this.growthPlans.push(growthPlan);
    }

    planGrowth() {
        super.planGrowth();
        if (this.originGrowth == null) {
            return;
        }
        if (this.curNumGrass == 0) {
            this.growGrass();
            return;
        }
        this.growGrass();
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