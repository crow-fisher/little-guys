import { hexToRgb, hsv2rgb, hueShiftColor, rgb2hsv, rgbToHex } from "../common.js";
import { loadGD, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_CLEAR, UI_PALETTE_ROCKIDX, UI_PALETTE_SOILIDX, UI_PALETTE_MODE, UI_PALETTE_MODE_ROCK } from "../ui/UIData.js";

export class Climate {
    constructor() {
        let soilColorBaseArr = ["#ad7c54", "#33251b", "#773319"];
        let rockColorBaseArr = ["#2b2f3d", "#141114", "#7e8097"];

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
            this.hueShiftColorArr(rockColorBaseArr, -150, -.2, 0),
            this.hueShiftColorArr(rockColorBaseArr, -100, -.1, 0),
            this.hueShiftColorArr(rockColorBaseArr, -50, -.05, 0),
            this.hueShiftColorArr(rockColorBaseArr, -0, -.15, 0),
            this.hueShiftColorArr(rockColorBaseArr, 50, -.13, 0),
            this.hueShiftColorArr(rockColorBaseArr, 100, -.1, 0),
            this.hueShiftColorArr(rockColorBaseArr, 150, -.05, 0),
        ]

        this.surfaceOnColorHex = "#50545e";
        this.surfaceOffColorHex = "#c3cde6";

        this.waterColor = hexToRgb("#31539D");
        this.surfaceOnColor = hexToRgb(this.surfaceOnColorHex);
        this.surfaceOffColor = hexToRgb(this.surfaceOffColorHex);

        this.weatherPatternMap = new Map();
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_CLEAR, 15);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, 10);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, 10);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_FOGGY, 5);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_LIGHTRAIN, 45);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_HEAVYRAIN, 25);

        this.lat = 42.04;
        this.lng = -87.78;
        this.uci = new Map();
    }

    hueShiftColorArr(arr, hueShift, saturationShift, valueShift) {
        return [hueShiftColor(arr[0], hueShift, saturationShift, valueShift), hueShiftColor(arr[1], hueShift, saturationShift, valueShift), hueShiftColor(arr[2], hueShift, saturationShift, valueShift)]
    }


    getWaterColor(frac=0.5) {
        return this.processColor(this.waterColor, frac);
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
        return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), 0, 0.70, 0.10), frac);
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


    getUIColorInactive(frac=0.6) {
        return this.getUIColorInactiveCustom(frac);
    }

    getUIColorActive(frac=0.6) {
        return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), 0, 0.10, 0.90), frac);
    }

    getUIColorTransient() {
        if (this.uct == null) {
            this.uct = this.processColor(this.getBaseSoilColor(0, 0.40, 0.40, 0.20), 0.6)
            return this.uct;
        }
        return this.uct;
    }

    getPaletteRockColor(frac=1) {
        return this.processColor(this.getBaseRockColor(loadGD(UI_PALETTE_ROCKIDX), .1, .1, .8), frac);
    }

    getPaletteSoilColor(frac=1) {
        return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), .4, .4, .2), frac);
    }

    getBaseColorActiveToolActivePalette(arr) {
        if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
            return this.getBaseRockColor(loadGD(UI_PALETTE_ROCKIDX), ...arr);
        } else {
            return this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), ...arr);
        }
    }

    getBaseActiveToolBrightnessIdx(idx, arr, brightness) {
        if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
            return this.processColor(this.getBaseRockColor(idx, ...arr), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(idx, ...arr), brightness);
        }
    }

    getBaseActiveToolBrightness(arr, brightness) {
        if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
            return this.processColor(this.getBaseRockColor(loadGD(UI_PALETTE_ROCKIDX), ...arr), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), ...arr), brightness);
        }
    }

    getBaseSoilColorBrightness(arr, brightness) {
        return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), ...arr), brightness);
    }
    getBaseSoilColorBrightnessIdx(idx, arr, brightness) {
        return this.processColor(this.getBaseSoilColor(idx, ...arr), brightness);
    }
    getBaseRockColorBrightnessIdx(idx, arr, brightness) {
        return this.processColor(this.getBaseRockColor(idx, ...arr), brightness);
    }
    getBaseActiveToolColorActiveIdx(brightness) {
        if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
            return this.processColor(this.getBaseRockColor(loadGD(UI_PALETTE_ROCKIDX), .4, .4, .2), brightness);
        } else {
            return this.processColor(this.getBaseSoilColor(loadGD(UI_PALETTE_SOILIDX), .4, .4, .2), brightness);
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