import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex } from "../common.js";
import { UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_LIGHTRAIN, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, UI_CLIMATE_WEATHER_SUNNY } from "../ui/UIData.js";

export class Climate {
    constructor() {
        this.soilColorSand = hexToRgb("#c99060");
        this.soilColorClay = hexToRgb("#773319");
        this.soilColorSilt = hexToRgb("#33251b");

        this.rockColorSand = hexToRgb("#666264");
        this.rockColorClay = hexToRgb("#020204");
        this.rockColorSilt = hexToRgb("#c4bebe");

        this.weatherPatternMap = new Map();
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_SUNNY, 60);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_PARTLY_CLOUDY, 30);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, 20);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_FOGGY, 10);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_LIGHTRAIN, 30);
        this.weatherPatternMap.set(UI_CLIMATE_WEATHER_HEAVYRAIN, 10);

        this.uci = new Map();
    }
    processColor(rgb, frac) {
        let hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
        hsv[2] =  (255 * (1 - frac)) + (hsv[2] * frac);
        rgb = hsv2rgb(hsv[0], hsv[1], hsv[2]);
        return rgbToHex(Math.floor(rgb[0]), Math.floor(rgb[1]), Math.floor(rgb[2]));
    }

    getUIColorInactiveCustom(frac) {
        if (this.uci[frac] == null) {
            this.uci[frac] = this.processColor(this.getBaseSoilColor(0, 0.70, 0.10), frac);
            return this.uci[frac];
        }
        return this.uci[frac];
    }


    getUIColorInactive() {
        return this.getUIColorInactiveCustom(0.6);
    }

    getUIColorActive() {
        if (this.uca == null) {
            this.uca = this.processColor(this.getBaseSoilColor(0, 0.10, 0.90), 0.6);
            return this.uca;
        }
        return this.uca;
    }

    getUIColorTransient() {
        if (this.uct == null) {
            this.uct = this.processColor(this.getBaseSoilColor(0.40, 0.40, 0.20), 0.6)
            return this.uct;
        }
        return this.uct;
    }
    getBaseSoilColor(sand, silt, clay) {
        return {
            r: clay * this.soilColorClay.r + silt * this.soilColorSilt.r + sand * this.soilColorSand.r, 
            g: clay * this.soilColorClay.g + silt * this.soilColorSilt.g + sand * this.soilColorSand.g, 
            b: clay * this.soilColorClay.b + silt * this.soilColorSilt.b + sand * this.soilColorSand.b
        }
    }
    
}