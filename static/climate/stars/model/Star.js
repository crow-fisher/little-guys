import { getStarHandler } from "../../../main.js";
import { addRenderJob, PointLabelRenderJob } from "../../../rasterizer.js";
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

        this._fovVisible = true;

        this.parsecs = Math.abs(1 / (parallax / 1000));
        this.parsecs_log = Math.log10(this.parsecs);
        this.magnitude_absolute = (magnitude + 5) - (5 * Math.log10(this.parsecs));
        this.cartesian = sphericalToCartesian(-this.asc, -this.dec, this.parsecs);
        this.lumens = brightnessValueToLumens(this.magnitude);
        this.sector = [-1, -1, -1];

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

    recalculateAltColor() {
        this._rac_curKey = loadGD(UI_AA_SETUP_COLORMODE);
        if (this._rac_curKey == null || this._rac_curKey == "default") {
            this.alt_color_arr = null;
            return;
        }

        this._rac_st = getStarHandler().paramStatistics.get(this._rac_curKey);
        this._rac_val = this[this._rac_curKey];
        this._rac_valNorm = invlerp(this._rac_st[2], this._rac_st[3], this._rac_val);
        this._rac_minValue = loadGD(UI_AA_SETUP_MIN);
        this._rac_windowSize = loadGD(UI_AA_SETUP_WINDOW_SIZE);
        this._rac_maxValue = lerp(this._rac_minValue, 1, this._rac_windowSize);
        this._rac_powValue = loadGD(UI_AA_SETUP_POW);

        this._rac_valNorm = Math.max(this._rac_valNorm, this._rac_minValue);
        this._rac_valNorm = Math.min(this._rac_valNorm, this._rac_maxValue);

        this._rac_v = invlerp(this._rac_minValue, this._rac_maxValue, this._rac_valNorm) ** this._rac_powValue;

        this.alt_color_arr = combineColorMult(feHMinColor, feHMaxColor, this._rac_v);
        this.alt_color = rgbToRgba(...this.alt_color_arr, this._opacity * Math.exp(loadGD(UI_AA_SETUP_MULT)));
    }

    doLocalitySelect(selectMode, selectRadius) {
        if (selectMode == 0) {
            this.localitySelect = false;
            return false;
        } else {
            if (this._curCameraDistance < selectRadius) {
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
            this.renderJob.color = this.renderColor;
            this.renderJob.label = this.starLabel;
        }

        if (this._screen[2] < 0) {
            addRenderJob(this.renderJob, false);
        }
    }
}