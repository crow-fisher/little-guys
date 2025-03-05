import { getBaseUISize } from "../../canvas.js";
import { setClimate } from "../../climate/weather.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import {
    UI_CLIMATE_SELECT,
    UI_CLIMATE_MIDWEST,
    UI_CLIMATE_DESERT,
    UI_CLIMATE_FANTASY,
    UI_CLIMATE_WEATHER_SUNNY,
    UI_CLIMATE_WEATHER_CLOUDY,
    UI_CLIMATE_WEATHER_LIGHTRAIN,
    UI_CLIMATE_WEATHER_HEAVYRAIN
} from "../UIData.js";
export class ClimateComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        var sizeX = getBaseUISize() * 16;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;
        container.addElement(new Text(this.window, sizeX * 2, getBaseUISize() * 1.5, "climate select"));
        container.addElement(new Radio(this.window, sizeX * 2, getBaseUISize() * 3, UI_CLIMATE_SELECT, [
            UI_CLIMATE_MIDWEST,
            UI_CLIMATE_DESERT,
            UI_CLIMATE_FANTASY
        ]));
    }
}