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
    UI_CLIMATE_WEATHER_DURATION,
    UI_CLIMATE_WEATHER_ACTIVE
} from "../UIData.js";
export class WeatherSelectionComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 38;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 

        let weatherRow1 = new Container(this.window, padding, 0);
        let weatherRow2 = new Container(this.window, padding, 0);
        let weatherRow3 = new Container(this.window, padding, 0);

        container.addElement(weatherRow1);
        container.addElement(weatherRow2);
        container.addElement(weatherRow3);

        weatherRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "sunny",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_SUNNY, () => getActiveClimate().getUIColorInactiveCustom(0.54), () => getActiveClimate().getUIColorTransient()));
        weatherRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "partly cloudy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, () => getActiveClimate().getUIColorInactiveCustom(0.56), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "mostly cloudy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "foggy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_FOGGY, () => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "light rain",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_LIGHTRAIN, () => getActiveClimate().getUIColorInactiveCustom(0.58), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "heavy rain",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_HEAVYRAIN, () => getActiveClimate().getUIColorInactiveCustom(0.55), () => getActiveClimate().getUIColorTransient()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2.5, UI_CENTER, "weather duration"));

        let weatherDurationRow1 = new Container(this.window, padding, 0);
        let weatherDurationRow2 = new Container(this.window, padding, 0);
        let weatherDurationRow3 = new Container(this.window, padding, 0);

        weatherDurationRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER,"30 min", UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 30,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "1 hr",UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 60, () => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "6 hr", UI_CLIMATE_WEATHER_DURATION , 0.000694444 * 60 * 6,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "24 hr", UI_CLIMATE_WEATHER_DURATION , 1,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "1 week", UI_CLIMATE_WEATHER_DURATION , 1 * 7,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        weatherDurationRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, UI_CENTER, "static",UI_CLIMATE_WEATHER_DURATION , 10 ** 4,() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));
        
        container.addElement(weatherDurationRow1);
        container.addElement(weatherDurationRow2);
        container.addElement(weatherDurationRow3);


    }
}