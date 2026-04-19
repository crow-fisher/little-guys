import { copyVecValue, multiplyVectorByScalar, multiplyVectorByScalarDest } from "../../../climate/stars/matrix.js";
import { randNumber, randRange, rR, rr } from "../../../common.js";
import { applyLightingFromSource } from "../../../lighting/lightingProcessing.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { loadGD, UI_ORGANISM_GRASS_GRASS, UI_ORGANISM_SOUP_GRASS } from "../../../ui/UIData.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { BasePlant, _llt_target, _llt_min, _llt_max, _llt_throttlValMax, _seedReduction, _waterPressureSoilTarget, _waterPressureOverwaterThresh, _waterPressureWiltThresh, _lightDecayValue, _lightLevelDisplayExposureAdjustment, baseOrganism_dnm } from "../BasePlant.js";
import { BasePlantSeed } from "../BasePlantSeed.js";
import { GrowthPlan } from "../growthPlan/GrowthPlan.js";
import { GrowthPlanStep } from "../growthPlan/GrowthPlanStep.js";
import { STAGE_ADULT, SUBTYPE_STEM, TYPE_STEM } from "../Stages.js";

export let grass_dnm = structuredClone(baseOrganism_dnm);

grass_dnm[_llt_target] = 1.45;
grass_dnm[_llt_min] = 0.74;
grass_dnm[_llt_max] = 1.43;
grass_dnm[_llt_throttlValMax] = 5.27;
grass_dnm[_seedReduction] = 0.10;
grass_dnm[_waterPressureSoilTarget] = -4;
grass_dnm[_waterPressureOverwaterThresh] = 1;
grass_dnm[_waterPressureWiltThresh] = -1.5;
grass_dnm[_lightDecayValue] = 4.42;
grass_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class SoupGrass extends BasePlant {
    constructor(square, seedLifeSquare, dna) {
        super(square, seedLifeSquare, dna);
        this.proto = "SoupGrass";
        this.uiRef = UI_ORGANISM_SOUP_GRASS;
        this.baseColor = [85, 128, 109];

        this.elements = [];
    }

    processGenetics() {
        /* genetics rules 
        'dna' is an array of floats. 
        */ 

        this._se = new Map();
        // this member is processsing a piece of grass
        
        // generate a piece of grass in the genetics
        let lm = 0.4;
        let lM = 0.6; 
        let l1 = rR(lm, lM);
        this.dna = [l1, rR(lm, lM), rR(lm, lM), rR(lm, lM), l1];
        for (let i = 0; i < this.dna.length; i++) {
            if (this._se.get(this.dna.at(i)) != null) {
                this._se.set(this.dna.at(i), [this._se.get(this.dna.at(i)), i])
            } else {
                this._se.set(this.dna.at(i), i);
            }
        }

    }

    getDefaultNutritionMap() {
        return grass_dnm;
    }
    
    getSeedClass() {
        return SoupGrassSeedOrganism;
    }

    growGrass() {
        let startNode = this.originGrowth.lifeSquares.at(0);
        let growthPlan = new GrowthPlan(
            false, STAGE_ADULT, TYPE_STEM,
            randRange(-.1, .1), .8, randRange(-.1, .1),
            randRange(-.1, .1), randRange(-.1, .1), randRange(-.1, .1), 1)
        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component));
            growthPlan.component.offset_base = [rr(2), rr(1) + 1.5, rr(2)]
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => {
                let node = this.growPlantSquare(startNode);
                node.subtype = SUBTYPE_STEM;
                return node;
            }
        ))
        this.growthPlans.push(growthPlan);
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => {
                            let node = this.growPlantSquare();
                            node.subtype = SUBTYPE_STEM;
                            return node;
                        }
                    ));
                };
            });
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }
        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.targetGrassLength < this.maxShootLength) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetGrasses < this.maxNumGrass) {
            this.targetGrasses += 1;
            return;
        }

        if (this.growthProgress >= 1) {
            this.spawnSeed();
        } 

    }

    prepareRender() {
    }
}

export class SoupGrassSeedOrganism extends BasePlantSeed {
    constructor(square, dna) {
        super(square, dna);
        this.proto = "SoupGrassSeedOrganism";
    }

    getSproutType() {
        return SoupGrass;
    }
    getSproutTypeProto() {
        return "SoupGrass";
    }
}