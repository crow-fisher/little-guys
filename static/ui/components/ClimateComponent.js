import { getBaseUISize } from "../../canvas.js";
import { setClimate, weather } from "../../climate/weather.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { Toggle } from "../elements/Toggle.js";
import {
    UI_CLIMATE_SELECT,
    UI_CLIMATE_MIDWEST,
    UI_CLIMATE_DESERT,
    UI_CLIMATE_FANTASY,
    UI_CLIMATE_WEATHER_SUNNY,
    UI_CLIMATE_WEATHER_CLOUDY,
    UI_CLIMATE_WEATHER_LIGHTRAIN,
    UI_CLIMATE_WEATHER_HEAVYRAIN,
    UI_CLIMATE_RAINFALL_DENSITY
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
        ]));

        let weatherDryContainer = new Container(this.window, padding, 0);
        let weatherWetContainer = new Container(this.window, padding, 0);

        container.addElement(weatherDryContainer);   
        container.addElement(weatherWetContainer);

        weatherDryContainer.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_SUNNY , "sunny"))
        weatherDryContainer.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_CLOUDY , "cloudy"))
        weatherWetContainer.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_LIGHTRAIN , "light rain"))
        weatherWetContainer.addElement(new Toggle(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 2.5, UI_CLIMATE_WEATHER_HEAVYRAIN , "heavy rain"))

        container.addElement(new Text(this.window, sizeX, getBaseUISize() * 2, "rainfall density"));
        container.addElement(new Slider(this.window,UI_CLIMATE_RAINFALL_DENSITY, sizeX, getBaseUISize() * 2, 1.001, 20));

    }
}