import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Radio } from "../elements/Radio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import {
    UI_CLIMATE_SELECT,
    UI_CLIMATE_MIDWEST,
    UI_CLIMATE_DESERT,
    UI_CLIMATE_FANTASY,
    UI_CLIMATE_WEATHER_SUNNY,
    UI_CLIMATE_WEATHER_LIGHTRAIN,
    UI_CLIMATE_WEATHER_HEAVYRAIN,
    UI_CLIMATE_RAINFALL_DENSITY,
    UI_CLIMATE_WEATHER_PARTLY_CLOUDY,
    UI_CLIMATE_WEATHER_MOSTLY_CLOUDY,
    UI_CLIMATE_WEATHER_FOGGY
} from "../UIData.js";
export class ClimateComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = getBaseUISize() * 32;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, "cilmate select"));
        container.addElement(new Radio(this.window, sizeX, getBaseUISize() * 3, UI_CLIMATE_SELECT, [
            UI_CLIMATE_MIDWEST,
            UI_CLIMATE_DESERT,
            UI_CLIMATE_FANTASY
        ],() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorActive()));

        let weatherRow1 = new Container(this.window, padding, 0);
        let weatherRow2 = new Container(this.window, padding, 0);
        let weatherRow3 = new Container(this.window, padding, 0);

        container.addElement(weatherRow1);
        container.addElement(weatherRow2);
        container.addElement(weatherRow3);

        weatherRow1.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_SUNNY , "sunny",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow1.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_PARTLY_CLOUDY , "partly cloudy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY , "mostly cloudy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow2.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_FOGGY , "foggy",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_LIGHTRAIN , "light rain",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));
        weatherRow3.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_HEAVYRAIN , "heavy rain",() => getActiveClimate().getUIColorInactive(), () => getActiveClimate().getUIColorTransient()));

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, "rainfall density"));
        container.addElement(new Slider(this.window,UI_CLIMATE_RAINFALL_DENSITY, sizeX, getBaseUISize() * 2, 1.001, 20, () => getActiveClimate().getUIColorTransient()));

    }
}