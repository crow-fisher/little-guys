import { COLOR_BLACK, COLOR_WHITE, RGB_COLOR_BROWN, RGB_COLOR_RED } from "../../../colors.js";
import { combineColorMult, combineColorMultArr, hsv2rgb, invlerp, lerp, rgbToHex } from "../../../common.js";
import { getStarHandler } from "../../../main.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../rendering/rasterizer.js";
import { WaterSquare } from "../../../squares/WaterSquare.js";
import { loadGD, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_MIN, UI_AA_SETUP_MULT, UI_AA_SETUP_POW, UI_AA_SETUP_WINDOW_SIZE, UI_SH_COLORSHIFT } from "../../../ui/UIData.js";
import { getActiveClimate } from "../../climateManager.js";
import { getVec3Length } from "../matrix.js";
import { brightnessValueToLumens, sphericalToCartesian } from "../starHandlerUtil.js";

export class Star {
    // ascension and declination in radians
    constructor(id, asc, dec, magnitude, bv, color, parallax, hd_number, temperature) {
        this.id = id;
        this.asc = asc;
        this.dec = dec;
        this.magnitude = magnitude;
        this.bv = bv;
        this.color = color;
        this.parallax = parallax;
        this.hd_number = hd_number;
        this.temperature = temperature;
        this.constellationStar = false;

        this.alt_color = [255, 255, 255];

        this._offset = [0, 0, 0];
        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0, 0];
        this._size = 0;
        this._opacity = 0;
        this._brightness = 0;
        this._distance = 0;
        this._curCameraDistance = 1
        this._rootCameraDistance = 1;
        this._relCameraDist = 1;
        this.recalculateScreenFlag = true;
        this.recalculateColorFlag = true;

        this._renderedThisFrame = true;

        this.parsecs = Math.abs(1 / (parallax / 1000));
        this.parsecs_log = Math.log10(this.parsecs);
        this.magnitude_absolute = (magnitude + 5) - (5 * Math.log10(this.parsecs));
        
        this.cartesian = sphericalToCartesian(-this.asc, -this.dec, this.parsecs);
        this.lumens = brightnessValueToLumens(this.magnitude);
        this.sector = null;

        this._rootCameraDistance = getVec3Length(this.cartesian);
        this._curCameraDistance = getVec3Length(this.cartesian);
        this._relCameraDist = (this._curCameraDistance / this._rootCameraDistance);
        this._relCameraDistBrightnessMult = 1 / (this._relCameraDist ** 2);
        this._curLumens = this.lumens;
    }

    getLabelForType(labelType, selectNamed, tX, tY, tC) {
        if (this.selected || this.localitySelect || (selectNamed && this.name != null)) {
            switch (labelType) {
                case 0:
                    return null;
                case 1:
                    return this.id;
                case 2:
                    return this.hd_number;
                case 3:
                    return this[tX].toFixed(2);
                case 4:
                    return this[tY].toFixed(2);
                case 5:
                    if (tC == "default")
                        return this.temperature.toFixed(0) + "K"
                    return this[tC].toFixed(2);
                case 6:
                    return (this.name ?? null);
            }
        }
        return null;
    }

    doLocalitySelect(selectMode, selectRadius) {
        if (selectMode == 0) {
            this.localitySelect = false;
            return false;
        } else {
            if (this._curCameraDistance < Math.exp(selectRadius)) {
                if (this.localitySelect)
                    return false;
                this.localitySelect = true;
                return true;
            } else {
                if (selectMode != 2) {
                    this.localitySelect = false;
                }
                return false;
            }
        }
    }

    render() {
        this._renderedThisFrame = true;

        if (this.renderColor == null) {
            return;
        }

        if (this.renderJob == null) {
            this.renderJob = new PointLabelRenderJob(
                this._renderScreen[0],
                this._renderScreen[1],
                this._screen[2],
                this._size,
                this.renderColor,
                this.starLabel,
                false);
        } else {
            this.renderJob.x = this._renderScreen[0]
            this.renderJob.y = this._renderScreen[1]
            this.renderJob.z = this._renderScreen[2]
            this.renderJob.size = this._size;
            this.renderJob.color = this.renderColor; // rgbToHex(...this.alt_color);
            this.renderJob.label = this.starLabel;
        }

        addRenderJob(this.renderJob, false);
    }
}