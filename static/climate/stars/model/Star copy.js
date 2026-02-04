import { getStarHandler } from "../../../main.js";

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
        
        this.parsecs = Math.abs(1 / (parallax / 1000));
        this.cartesian = [0, 0, 0];

        sphericalToCartesianInplace(this.cartesian, -this.asc, -this.dec, this.parsecs);
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

    setFeH(feH) {
        this.p_feH = feH;
        this.recalculateAltColor();
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

    recalculateScreen(frameCache) {
        this._distance = this.parsecs * (10 ** frameCache.UI_STARMAP_ZOOM);
        sphericalToCartesianInplace(this._cartesian, -this.asc, -this.dec, this._distance);
        this._rootCameraDistance = getVec3Length(this._cartesian);
        this.recalculateScreenFlag = false;
    }

    recalculateSizeOpacityColor(frameCache) {
        if (this._prevRelCameraDist == null || this.recalculateColorFlag || this._relCameraDist / this._prevRelCameraDist < 0.9 || this._prevRelCameraDist / this._relCameraDist < 0.9) {
            this.recalculateColorFlag = false;
            this._prevRelCameraDist = this._relCameraDist;
            this._brightness = (this.name != null ? frameCache.namedStarOpacityMult : 1) * brightnessValueToLumensNormalized((this.magnitude) + frameCache.UI_SH_STYLE_BRIGHTNESS_A) / (this._relCameraDist ** 2);

            this._size = (this._brightness ** frameCache.UI_SH_STYLE_SIZE_A) * frameCache.UI_SH_MINSIZE;
            this._opacity = (this._brightness ** frameCache.UI_SH_STYLE_BRIGHTNESS_B);

            if (this._size < frameCache.starMinSize) {
                this._brightnessVisible = false;
                return;
            } else {
                this._brightnessVisible = true;
            }
            this._color = rgbToRgba(...this.color, Math.min(1, this._opacity * frameCache.UI_SH_STYLE_SIZE_B));
            if (this.alt_color_arr != null)
                this.alt_color = rgbToRgba(...this.alt_color_arr, this._opacity * frameCache.UI_AA_SETUP_MULT ?? 1);
        }
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

    prepare(frameCache) {
        this._curCameraDistance = calculateDistance(frameCache.UI_CAMERA_OFFSET_VEC, this._cartesian);
        this._relCameraDist = (this._curCameraDistance / this._rootCameraDistance);

        frameCache.newStarSelected |= this.doLocalitySelect(frameCache.UI_AA_PLOT_LOCALITY_SELECTMODE, frameCache.selectRadius);

        if (this.recalculateScreenFlag) {
            this.recalculateScreen(frameCache);
            this._prevRelCameraDist = null;
        }

        this.recalculateSizeOpacityColor(frameCache);

        if (!this._brightnessVisible) {
            return;
        }

        this._offset[0] = this._cartesian[0] - frameCache.UI_CAMERA_OFFSET_VEC[0];
        this._offset[1] = this._cartesian[1] - frameCache.UI_CAMERA_OFFSET_VEC[1];
        this._offset[2] = this._cartesian[2] - frameCache.UI_CAMERA_OFFSET_VEC[2];

        cartesianToScreenInplace(this._offset, this._camera, this._screen);
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, frameCache._xOffset, frameCache._yOffset, frameCache._s);

        if (this.selected || this.localitySelect) {
            this.activeId = (frameCache.UI_AA_LABEL_STARS == 0) ? this.id : this.hd_number;
        }
    }
    render(renderMode, renderLabel) {
        if (!this._brightnessVisible) {
            return;
        }

        this._fovVisible = false;
        if (this._screen == null || this._screen[2] < 0) {
            return;
        }
        if (this._renderScreen[0] < 0 || this._renderScreen[0] > getTotalCanvasPixelWidth()) {
            return;
        }
        if (this._renderScreen[1] < 0 || this._renderScreen[1] > getTotalCanvasPixelHeight()) {
            return;
        }

        this._fovVisible = true;
        this.renderColor = (renderMode == "default") ? this._color : this.alt_color;

        if (this.renderColor != null)
            addRenderJob(new PointLabelRenderJob(
                this._renderScreen[0],
                this._renderScreen[1],
                this._screen[2],
                this._size,
                this.renderColor,
                this.starLabel,
                false));
    }
}