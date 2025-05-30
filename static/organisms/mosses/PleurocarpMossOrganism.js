import { GenericRootSquare } from "../../lifeSquares/GenericRootSquare.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { baseOrganism_dnm } from "../BaseOrganism.js";
import { UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_MOSS_PLEUROCARP } from "../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../BaseOrganism.js";
import { PleurocarpMossGreenSquare } from "../../lifeSquares/mosses/PleurocarpMossGreenSquare.js";
import { BaseMossOrganism } from "./BaseMossOrganism.js";

export let pmoss_dnm = structuredClone(baseOrganism_dnm);
pmoss_dnm[_llt_min] = 0.59;
pmoss_dnm[_llt_max] = 1.43;
pmoss_dnm[_llt_throttlValMax] = 4.13;
pmoss_dnm[_seedReduction] = 0.09;
pmoss_dnm[_waterPressureSoilTarget] = -3.4;
pmoss_dnm[_waterPressureOverwaterThresh] = 1;
pmoss_dnm[_waterPressureWiltThresh] = -1.47;
pmoss_dnm[_lightDecayValue] = 0.47;

export class PleurocarpMossOrganism extends BaseMossOrganism {
    constructor(square) {
        super(square);
        this.proto = "PleurocarpMossOrganism";
        this.uiRef = UI_ORGANISM_MOSS_PLEUROCARP;
        this.greenType = PleurocarpMossGreenSquare;
    }

    getDefaultNutritionMap() {
        return pmoss_dnm;
    }

}

export class PleurocarpMossSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters) {
        super(square, evolutionParameters);
        this.proto = "PleurocarpMossSeedOrganism";
    }

    getSproutType() {
        return PleurocarpMossOrganism;
    }
    getSproutTypeProto() {
        return "PleurocarpMossOrganism";
    }
}