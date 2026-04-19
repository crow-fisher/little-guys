import { copyVecValue, multiplyVectorByScalar, multiplyVectorByScalarDest } from "../../../climate/stars/matrix.js";
import { randNumber, randRange, rr } from "../../../common.js";
import { applyLightingFromSource } from "../../../lighting/lightingProcessing.js";
import { addSquare } from "../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../squares/SeedSquare.js";
import { loadGD, UI_ORGANISM_GRASS_FGRASS, UI_ORGANISM_GRASS_GRASS } from "../../../ui/UIData.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";
import { RootLifeSquare } from "../../lifeSquares/RootLifeSquare.js";
import { BasePlant, _llt_target, _llt_min, _llt_max, _llt_throttlValMax, _seedReduction, _waterPressureSoilTarget, _waterPressureOverwaterThresh, _waterPressureWiltThresh, _lightDecayValue, _lightLevelDisplayExposureAdjustment, baseOrganism_dnm } from "../BasePlant.js";
import { BasePlantSeed } from "../BasePlantSeed.js";
import { GrowthPlan } from "../growthPlan/GrowthPlan.js";
import { GrowthPlanStep } from "../growthPlan/GrowthPlanStep.js";
import { STAGE_ADULT, SUBTYPE_STEM, TYPE_STEM } from "../Stages.js";
import { OriginGrass } from "./OriginGrass.js";

export let fgrass_dnm = structuredClone(baseOrganism_dnm);

fgrass_dnm[_llt_target] = 1.45;
fgrass_dnm[_llt_min] = 0.74;
fgrass_dnm[_llt_max] = 1.43;
fgrass_dnm[_llt_throttlValMax] = 5.27;
fgrass_dnm[_seedReduction] = 0.10;
fgrass_dnm[_waterPressureSoilTarget] = -4;
fgrass_dnm[_waterPressureOverwaterThresh] = 1;
fgrass_dnm[_waterPressureWiltThresh] = -1.5;
fgrass_dnm[_lightDecayValue] = 4.42;
fgrass_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class FlatGrass extends OriginGrass {
    constructor(square, seedLifeSquare, dna) {
        super(square, seedLifeSquare, dna);
        this.proto = "FlatGrass";
        this.uiRef = UI_ORGANISM_GRASS_FGRASS;
        this.baseColor = [114, 37, 117];
        this.targetGrasses = 1;
        this.maxNumGrass = 1;
        this.targetGrassLength = 1;
        this.maxShootLength = 12;
        this.grasses = [];
    }

    getDefaultNutritionMap() {
        return fgrass_dnm;
    }

    getSeedClass() {
        return FlatGrassSeedOrganism;
    }
}

export class FlatGrassSeedOrganism extends BasePlantSeed {
    constructor(square, dna) {
        super(square, dna);
        this.proto = "FlatGrassSeedOrganism";
    }

    getSproutType() {
        return FlatGrass;
    }
    getSproutTypeProto() {
        return "FlatGrass";
    }
}