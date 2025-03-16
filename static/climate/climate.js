import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex } from "../common.js";
import { loadUI, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_SUNNY, UI_PALETTE_ROCKIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_SOILIDX } from "../ui/UIData.js";

export class Climate {
    constructor() {
        this.soilColors = [
            [hexToRgb("#c99060"), hexToRgb("#33251b"), hexToRgb("#773319")],
            [hexToRgb("#c99660"), hexToRgb("#382c1f"), hexToRgb("#693714")],
            [hexToRgb("#c98360"), hexToRgb("#38281f"), hexToRgb("#692b14")],
            [hexToRgb("#b36a5b"), hexToRgb("#362621"), hexToRgb("#632419")]

        ]
        this.rockColors = [
            [hexToRgb("#a8927b"), hexToRgb("#8c9a9b"), hexToRgb("#a0b9c1")],
            [hexToRgb("#7e8097"), hexToRgb("#4d5469"), hexToRgb("#141114")],
            [hexToRgb("#626665"), hexToRgb("#534938"), hexToRgb("#756d5f")],
            [hexToRgb("#a6bdcb"), hexToRgb("#5c5a6a"), hexToRgb("#a3b4c5")],
            
        ]

        this.waterColor = hexToRgb("#31539D");
        this.surfaceOnColor = hexToRgb("#50545e");
        this.surfaceOffColor = hexToRgb("#c3cde6");

        this.weatherPatternMap = new Map();
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_SUNNY, 60);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, 30);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, 20);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_FOGGY, 10);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_LIGHTRAIN, 30);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_HEAVYRAIN, 10);

        this.uci = new Map();
    }

    getWaterColor() {
        return this.processColor(this.waterColor, 0.5);
    }

    getWaterColorDark() {
        return this.processColor(this.waterColor, 0.7);
    }

    getSurfaceOnColor() {
        return this.processColor(this.surfaceOnColor, 0.5);
    }

    getSufaceOffColor() {
        return this.processColor(this.surfaceOffColor, 0.5);
    }

    processColor(rgb, frac) {
        let hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
        hsv[2] =  (255 * (1 - frac)) + (hsv[2] * frac);
        rgb = hsv2rgb(hsv[0], hsv[1], hsv[2]);
        return rgbToHex(Math.floor(rgb[0]), Math.floor(rgb[1]), Math.floor(rgb[2]));
    }

    getUIColorInactiveCustom(frac) {
        if (this.uci[frac] == null) {
            this.uci[frac] = this.processColor(this.getBaseSoilColor(0, 0, 0.70, 0.10), frac);
            return this.uci[frac];
        }
        return this.uci[frac];
    }

    getUIColorStoneButton(frac) {
        if (this.uci[frac] == null) {
            this.uci[frac] = this.processColor(this.getBaseSoilColor(0, 0, 0.70, 0.10), frac);
            return this.uci[frac];
        }
        return this.uci[frac];
    }

    getUIColorDirtButton(frac) {
        if (this.uci[frac] == null) {
            this.uci[frac] = this.processColor(this.getBaseSoilColor(0, 0, 0.70, 0.10), frac);
            return this.uci[frac];
        }
        return this.uci[frac];
    }


    getUIColorInactive() {
        return this.getUIColorInactiveCustom(0.6);
    }

    getUIColorActive() {
        if (this.uca == null) {
            this.uca = this.processColor(this.getBaseSoilColor(0, 0, 0.10, 0.90), 0.6);
            return this.uca;
        }
        return this.uca;
    }

    getUIColorTransient() {
        if (this.uct == null) {
            this.uct = this.processColor(this.getBaseSoilColor(0, 0.40, 0.40, 0.20), 0.6)
            return this.uct;
        }
        return this.uct;
    }

    getPaletteRockColor() {
        return this.processColor(this.getBaseRockColor(loadUI(UI_PALETTE_ROCKIDX), .4, .4, .2), 1);
    }

    getPaletteSoilColor() {
        return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), .4, .4, .2), 1);
    }

    getBaseColorActiveToolActivePalette(arr) {
        if (loadUI(UI_PALETTE_ROCKMODE)) {
            return this.getBaseRockColor(loadUI(UI_PALETTE_ROCKIDX), ...arr);
        } else {
            return this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), ...arr);
        }
    }

    getBaseActiveToolBrightnessIdx(idx, arr, brightness) {
        if (loadUI(UI_PALETTE_ROCKMODE)) {
            return this.processColor(this.getBaseRockColor(idx, ...arr), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(idx, ...arr), brightness);
        }
    }

    getBaseActiveToolBrightness(arr, brightness) {
        if (loadUI(UI_PALETTE_ROCKMODE)) {
            return this.processColor(this.getBaseRockColor(loadUI(UI_PALETTE_ROCKIDX), ...arr), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), ...arr), brightness);
        }
    }

    getBaseSoilColorBrightness(arr, brightness) {
        return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), ...arr), brightness);
    }
    getBaseSoilColorBrightnessIdx(idx, arr, brightness) {
        return this.processColor(this.getBaseSoilColor(idx, ...arr), brightness);
    }
    getBaseRockColorBrightnessIdx(idx, arr, brightness) {
        return this.processColor(this.getBaseRockColor(idx, ...arr), brightness);
    }
    getBaseActiveToolColorActiveIdx(brightness) {
        if (loadUI(UI_PALETTE_ROCKMODE)) {
            return this.processColor(this.getBaseRockColor(loadUI(UI_PALETTE_ROCKIDX), .4, .4, .2), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), .4, .4, .2), brightness);
        }
    }

    getBaseSoilColor(idx, sand, silt, clay) {
        idx = idx % this.soilColors.length;
        return {
            r: this.soilColors[idx][0].r * sand + this.soilColors[idx][1].r * silt + this.soilColors[idx][2].r * clay, 
            g: this.soilColors[idx][0].g * sand + this.soilColors[idx][1].g * silt + this.soilColors[idx][2].g * clay, 
            b: this.soilColors[idx][0].b * sand + this.soilColors[idx][1].b * silt + this.soilColors[idx][2].b * clay
        }
    }
    getBaseRockColor(idx, sand, silt, clay) {
        idx = idx % this.rockColors.length;
        return {
            r: sand * this.rockColors[idx][0].r + silt * this.rockColors[idx][1].r + clay * this.rockColors[idx][2].r, 
            g: sand * this.rockColors[idx][0].g + silt * this.rockColors[idx][1].g + clay * this.rockColors[idx][2].g, 
            b: sand * this.rockColors[idx][0].b + silt * this.rockColors[idx][1].b + clay * this.rockColors[idx][2].b
        }
    }
}