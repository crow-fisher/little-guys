import { hexToRgb, rgbToHex } from "../common.js";
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
    }

    getUIColorInactive() {
        if (this.uci == null) {
            let rgb = this.getBaseSoilColor(0.2, 0.70, 0.10);
            this.uci = rgbToHex(Math.floor(rgb.r), Math.floor(rgb.g), Math.floor(rgb.b));
            return this.uci;
        }
        return this.uci;
    }

    getUIColorActive() {
        if (this.uca == null) {
            let rgb = this.getBaseSoilColor(0.0, 0.10, 0.90);
            this.uca = rgbToHex(Math.floor(rgb.r), Math.floor(rgb.g), Math.floor(rgb.b));
            return this.uca;
        }
        return this.uca;
    }

    getUIColorTransient() {
        if (this.uct == null) {
            let rgb = this.getBaseSoilColor(0.40, 0.40, 0.20);
            this.uct = rgbToHex(Math.floor(rgb.r), Math.floor(rgb.g), Math.floor(rgb.b));
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