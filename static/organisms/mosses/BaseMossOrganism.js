import { zoomCanvasFillRect } from "../../canvas.js";
import { getCurDay } from "../../climate/time.js";
import { COLOR_BLACK, COLOR_BLUE, RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { removeItemAll } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { GenericRootSquare } from "../../lifeSquares/GenericRootSquare.js";
import { PleurocarpMossGreenSquare } from "../../lifeSquares/mosses/PleurocarpMossGreenSquare.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";
import { getNeighbors } from "../../squares/_sqOperations.js";
import { loadGD, UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA, UI_ORGANISM_SELECT, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT } from "../../ui/UIData.js";
import { removeOrganism } from "../_orgOperations.js";
import {
    _llt_min,
    _llt_max,
    _llt_throttlValMin,
    _llt_throttlValMax,
    _waterPressureSoilTarget,
    _seedReduction,
    _lightDecayValue,
    _waterPressureOverwaterThresh,
    _waterPressureWiltThresh,
    _llt_target
} from "../BaseOrganism.js";

export let baseMossOrganism_dnm = {
    _llt_target: 1,
    _llt_min: 0.5,
    _llt_max: 2,
    _llt_throttlValMin: 1,
    _llt_throttlValMax: 4,
    _waterPressureSoilTarget: -2.46,
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
        this.rootType = GenericRootSquare;
        this.evolutionMinColor = RGB_COLOR_BLUE;
        this.evolutionMaxColor = RGB_COLOR_VERY_FUCKING_RED;
        

        this.mossTickGrowthRate = 15;

        this.lastTickTime = Date.now();
        this.growthPlans = []; // stub, hack for saveAndLoad.js 
        this.organismColor = COLOR_BLUE;
    }

    getEvolutionColor(opacity) {
        return COLOR_BLACK;
    }
    getGenericNutritionParam(name) {
        let defaultMap = this.getDefaultNutritionMap();
        let configMap = loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[this.uiRef];
        if (configMap == null || configMap[name] == null) {
            return defaultMap[name];
        }
        return configMap[name];
    }
    llt_target() {
        return this.getGenericNutritionParam(_llt_target);
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
        removeItemAll(this.lifeSquares, mossSquare);
    }

    processGenetics() { } // fill this out in your implementation class!

    growNeighborMoss(parentLsq) {
        let square = getNeighbors(parentLsq.posX, parentLsq.posY)
            .filter((sq) => sq.proto == "SoilSquare" || sq.proto == "RockSquare")
            .find((sq) => !(sq.linkedOrganismSquares.some((lsq) => lsq.linkedOrganism.proto == this.proto)));
        if (square != null) {
            let newMoss = new this.greenType(square, this);
            newMoss.mossSqTick();
            let tml = Math.abs(newMoss.tickMoistureLevel); 
            let tll = Math.abs(newMoss.tickLightLevel);

            if (tll == 1 || tml == 1) {
                newMoss.destroy();
                return false;
            }

            let newMossOpacity = (1 - Math.max(tml, tll)) / this.mossTickGrowthRate;
            newMossOpacity = Math.min(newMossOpacity, square.mossSpaceRemaining());
            if (newMossOpacity <= 0) {
                newMoss.destroy();
                return false;
            }
            newMoss.opacity = newMossOpacity;
            this.lifeSquares.push(newMoss);
            return true;
        }
        return false;
    }

    nutrientGrowthTick() {
        let scoreArr = Array.from(this.lifeSquares.map((lsq) => [lsq, lsq.mossSqTick()]));
        scoreArr.sort((a, b) => a[1][0] * a[1][1] - b[1][0] * b[1][1]);
        scoreArr
            .map((arr) => arr[0])
            .find((lsq) => this.growNeighborMoss(lsq));
    }

    process() {
        if (this.lifeSquares.length == 0) {
            this.growMossSquare(this.linkedSquare);
        }
        if (Date.now() - this.lastTickTime < 300) {
            return;
        }
        this.lastTickTime = Date.now();

        this.nutrientGrowthTick();
        this.lifeSquares
            .filter((lsq) => lsq.opacity <= 0)
            .forEach((lsq) => lsq.destroy());
        this.lastTickTime = Date.now();

    }
    render() {
        this.lifeSquares.forEach((lsq) => lsq.render()); 
        if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_ORGANISMS) {
            MAIN_CONTEXT.fillStyle = this.organismColor;
            zoomCanvasFillRect(this.posX, this.posY, 1, 1);
        }
    }
    destroy() {
        this.lifeSquares.forEach((lsq) => lsq.destroy());
        removeOrganism(this);
        return;
    }

}