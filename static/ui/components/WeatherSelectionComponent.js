import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Container } from "../Container.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import { LockedComponent } from "../LockedComponent.js";
import {
    UI_CLIMATE_WEATHER_SUNNY,
    UI_CLIMATE_WEATHER_LIGHTRAIN,
    UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_PARTLY_CLOUDY,
    UI_CLIMATE_WEATHER_MOSTLY_CLOUDY,
    UI_CLIMATE_WEATHER_FOGGY, UI_CENTER,
    UI_CLIMATE_WEATHER_DURATION
} from "../UIData.js";
export class WeatherSelectionComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        var sizeX = getBaseUISize() * 32;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2.5, UI_CENTER, "weather select"));

        let weatherRow1 = new Container(this.window, padding, 0);
        let weatherRow2 = new Container(this.window, padding, 0);
        let weatherRow3 = new Container(this.window, padding, 0);

        container.addElement(weatherRow1);
        container.addElement(weatherRow2);
        container.addElement(weatherRow3);

        weatherRow1.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_SUNNY , "sunny",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow1.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_PARTLY_CLOUDY , "partly cloudy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY , "mostly cloudy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_FOGGY , "foggy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_LIGHTRAIN , "light rain",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, UI_CLIMATE_WEATHER_HEAVYRAIN , "heavy rain",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2.5, UI_CENTER, "weather duration"));

        let weatherDurationRow1 = new Container(this.window, padding, 0);
        let weatherDurationRow2 = new Container(this.window, padding, 0);

        weatherDurationRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER,"5 min", UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 5,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, "30 min",UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 30, () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, "1 hr", UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 60,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CENTER, "static",UI_CLIMATE_WEATHER_DURATION , 10 ** 8,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(weatherDurationRow1);
        container.addElement(weatherDurationRow2);


    }
}