import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex } from "../common.js";
import { loadUI, UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_SUNNY, UI_PALLATE_VARIANT } from "../ui/UIData.js";

export class Climate {
    constructor() {
        this.soilColors = [
            [hexToRgb("#c99060"), hexToRgb("#773319"), hexToRgb("#33251b")],
            [hexToRgb("#93a2c3"), hexToRgb("#3e4e80"), hexToRgb("#31284f")]
        ]

        this.rockColorSand = hexToRgb("#666264");
        this.rockColorClay = hexToRgb("#020204");
        this.rockColorSilt = hexToRgb("#c4bebe");

        this.waterColor = hexToRgb("#31539D");
        this.surfaceOnColor = {r: 172, g: 35, b: 226};
        this.surfaceOffColor = {r: 30, g: 172, b: 58};

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

    getBaseSoilColorBrightness(arr, brightness) {
        return this.processColor(this.getBaseSoilColor(loadUI(UI_PALLATE_VARIANT), ...arr), brightness);
    }
    getBaseSoilColorBrightnessIdx(idx, arr, brightness) {
        return this.processColor(this.getBaseSoilColor(idx, ...arr), brightness);
    }

    getBaseSoilColor(idx, sand, silt, clay) {
        idx = idx % this.soilColors.length;
        return {
            r: sand * this.soilColors[idx][0].r + silt * this.soilColors[idx][1].r + clay * this.soilColors[idx][2].r, 
            g: sand * this.soilColors[idx][0].g + silt * this.soilColors[idx][1].g + clay * this.soilColors[idx][2].g, 
            b: sand * this.soilColors[idx][0].b + silt * this.soilColors[idx][1].b + clay * this.soilColors[idx][2].b
        }
    }
}