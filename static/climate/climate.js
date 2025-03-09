import { hexToRgb } from "../common.js";
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
}