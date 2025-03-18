import { hexToRgb, hexToRgbArr, hsv2rgb, hueShiftColor, rgb2hsv, rgbToHex } from "../common.js";
import { loadUI, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_SUNNY, UI_PALETTE_ROCKIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_SOILIDX } from "../ui/UIData.js";

export class Climate {
    constructor() {
        let soilColorBaseArr = ["#c99060", "#33251b", "#773319"];
        this.soilColors = [
            this.hueShiftColorArr(soilColorBaseArr, -15, 0, -10),
            this.hueShiftColorArr(soilColorBaseArr, -10, 0, -10),
            this.hueShiftColorArr(soilColorBaseArr, -5, 0, -10),
            this.hueShiftColorArr(soilColorBaseArr, -0, 0, -10),
            this.hueShiftColorArr(soilColorBaseArr, 5, 0, -10),
            this.hueShiftColorArr(soilColorBaseArr, 10, 0, -20),
            this.hueShiftColorArr(soilColorBaseArr, 15, 0, -30)

        ]
        this.rockColors = [
            [hexToRgb("#a0b9c1"), hexToRgb("#303536"), hexToRgb("#a8927b")],
            [hexToRgb("#2b2f3d"), hexToRgb("#141114"), hexToRgb("#7e8097")],
            [hexToRgb("#949c9a"), hexToRgb("#534938"), hexToRgb("#a89065")],
            [hexToRgb("#a6bdcb"), hexToRgb("#2f2d3d"), hexToRgb("#a3b4c5")],
            [hexToRgb("#957068"), hexToRgb("#332b2a"), hexToRgb("#733016")],
            
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

    hueShiftColorArr(arr, hueShift, saturationShift, valueShift) {
        return [hueShiftColor(arr[0], hueShift, saturationShift, valueShift), hueShiftColor(arr[1], hueShift, saturationShift, valueShift), hueShiftColor(arr[2], hueShift, saturationShift, valueShift)]
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
        return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), 0, 0.70, 0.10), frac);
    }

    getUIColorStoneButton(frac) {
        return this.processColor(this.getBaseRockColor(0, 0, 0.70, 0.10), frac);
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
        return this.processColor(this.getBaseSoilColor(loadUI(UI_PALETTE_SOILIDX), 0, 0.10, 0.90), 0.6);
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