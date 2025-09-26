import { addSquare, getSquares } from "../_sqOperations.js";
import { WaterSquare } from "../WaterSquare.js";
import { hexToRgb, processColorLerp, processColorLerpBicolor, randNumber } from "../../common.js";
import { RockSquare } from "./RockSquare.js";
import { BaseSquare } from "../BaseSqaure.js";
import { loadGD, UI_PALETTE_ACTIVE, UI_PALETTE_AQUIFER, UI_PALETTE_AQUIFER_FLOWRATE, UI_PALETTE_ERASE, UI_PALETTE_SELECT } from "../../ui/UIData.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { getWaterColor, getWaterColorDark } from "../../ui/components/LightingComponent.js";
import { getBaseSize, getBaseUISize, zoomCanvasFillRect } from "../../canvas.js";
import { COLOR_BLACK } from "../../colors.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { applyLightingFromSource } from "../../lighting/lightingProcessing.js";

class AquiferSquare extends BaseSquare {
    constructor(posX, posY) { 
        super(posX, posY);
        this.baseColor = "#E5E4E2";
        this.darkColor = "#C0C0C0";
        this.accentColor = "#708090";
        this.physicsEnabled = false;
        this.collision = false;
        this.proto = "AquiferSquare";
        this.waterContainmentMax = 1;
        this.waterContainmentTransferRate = 0;
        this.opacity = 0.003;
        this.solid = false;
        this.flowrate = loadGD(UI_PALETTE_AQUIFER_FLOWRATE);
    }
    gravityPhysics() {
        if (Math.random() > (this.flowrate / 4)) {
            return;
        }
        let sq = addSquare(new WaterSquare(this.posX, this.posY + 1));
        if (sq) {
            sq.temperature = this.temperature;
            sq.speedY = randNumber(-1, 1);
            sq.blockHealth = loadGD(UI_PALETTE_AQUIFER_FLOWRATE);
            applyLightingFromSource(this, sq);
        }
    }
    render() {
        if (
            loadGD(UI_PALETTE_ACTIVE) && (
            loadGD(UI_PALETTE_SELECT) == UI_PALETTE_AQUIFER || loadGD(UI_PALETTE_SELECT) == UI_PALETTE_ERASE)) {
            MAIN_CONTEXT.fillStyle = calculateColor(this.flowrate, 0, 1, hexToRgb(getWaterColorDark()), hexToRgb(getWaterColor()));
            zoomCanvasFillRect(
                this.posX * getBaseSize(),
                this.posY * getBaseSize(),
                getBaseSize(),
                getBaseSize()
            );
        }
    }
}

export {AquiferSquare}