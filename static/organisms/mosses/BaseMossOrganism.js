import { getCurDay } from "../../climate/time.js";
import { RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { removeItemAll } from "../../common.js";
import { PleurocarpMossGreenSquare } from "../../lifeSquares/mosses/PleurocarpMossGreenSquare.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { getNeighbors } from "../../squares/_sqOperations.js";
import { loadGD, UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA, UI_ORGANISM_SELECT } from "../../ui/UIData.js";
import {
    _llt_min,
    _llt_max,
    _llt_throttlValMin,
    _llt_throttlValMax,
    _waterPressureSoilTarget,
    _seedReduction,
    _lightDecayValue,
    _waterPressureOverwaterThresh,
    _waterPressureWiltThresh
} from "../BaseOrganism.js";

export let baseMossOrganism_dnm = {
    _llt_min: 0.5,
    _llt_max: 2,
    _llt_throttlValMin: 1,
    _llt_throttlValMax: 4,
    _waterPressureSoilTarget: -4,
    _seedReduction: 0.5,
    _lightDecayValue: 1,
    _waterPressureOverwaterThresh: 1,
    _waterPressureWiltThresh: -1
}

export class BaseMossOrganism {
    constructor(square) {
        this.proto = "BaseMossOrganism";
        this.uiRef = UI_ORGANISM_SELECT;
        this.posX = square.posX;
        this.posY = square.posY;
        this.linkSquare(square);
        this.spawnTime = getCurDay();
        this.lifeSquares = new Array();
        this.tickEnergy = 0;

        this.greenType = PleurocarpMossGreenSquare; // eg 

        this.evolutionMinColor = RGB_COLOR_BLUE;
        this.evolutionMaxColor = RGB_COLOR_VERY_FUCKING_RED;
    }
    getGenericNutritionParam(name) {
        let defaultMap = this.getDefaultNutritionMap();
        let configMap = loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[this.uiRef];
        if (configMap == null || configMap[name] == null) {
            return defaultMap[name];
        }
        return configMap[name];
    }

    llt_min() {
        return this.getGenericNutritionParam(_llt_min);
    }
    llt_max() {
        return this.getGenericNutritionParam(_llt_max);
    }
    llt_throttlValMin() {
        return this.getGenericNutritionParam(_llt_throttlValMin);
    }
    llt_throttlValMax() {
        return this.getGenericNutritionParam(_llt_throttlValMax);
    }
    waterPressureSoilTarget() {
        return this.getGenericNutritionParam(_waterPressureSoilTarget);
    }
    seedReduction() {
        return this.getGenericNutritionParam(_seedReduction);
    }
    lightDecayValue() {
        return this.getGenericNutritionParam(_lightDecayValue);
    }
    waterPressureOverwaterThresh() {
        return this.getGenericNutritionParam(_waterPressureOverwaterThresh);
    }
    waterPressureWiltThresh() {
        return this.getGenericNutritionParam(_waterPressureWiltThresh);
    }

    linkSquare(square) {
        this.linkedSquare = square;
        square.linkOrganism(this);
    }
    unlinkSquare() {
        this.linkedSquare = null;
    }

    setEvolutionParameters(evolutionParameters) {
        this.evolutionParameters = evolutionParameters;
        this.processGenetics();
    }

    growMossSquare(square) {
        let newMoss = new this.greenType(square, this);
        this.lifeSquares.push(newMoss);
    }

    killMossSquare(mossSquare) {
        mossSquare.destroy();
        removeItemAll(this.lifeSquares, mossSquare);
    }

    processGenetics() { } // fill this out in your implementation class!

    growNeighborMoss(parentLsq) {
        let square = getNeighbors(parentLsq.posX, parentLsq.posY)
            .filter((sq) => sq.rootable)
            .find((sq) => !(sq.linkedOrganismSquares.some((lsq) => lsq.linkedOrganism == this)));
        if (square != null) {
            let newMoss = new this.greenType(square, this);
            this.lifeSquares.push(newMoss);
            return true;
        }
        return false;
    }

    nutrientGrowthTick() {
        let scoreArr = Array.from(this.lifeSquares.map((lsq) => [lsq, lsq.mossSqTick()]));
        scoreArr.sort((a, b) => a[1] - b[1]);
        if (Math.min(...scoreArr.map((arr) => arr[1])) > 0.5) {
            let mossParent = scoreArr.map((arr) => arr[0]).find((lsq) => this.growNeighborMoss(lsq));
            if (mossParent != null) {
                console.log("grew from ", mossParent);
            }
        }
    }

    process() {
        if (this.lifeSquares.length == 0) {
            this.growMossSquare(this.linkedSquare);
        }
        this.nutrientGrowthTick();
        this.lifeSquares.filter((lsq) => lsq.tickMoistureLevel < 0.25).forEach((lsq) => this.killMossSquare(lsq));
    }
    render() {
        this.lifeSquares.forEach((lsq) => lsq.render());
    }

}