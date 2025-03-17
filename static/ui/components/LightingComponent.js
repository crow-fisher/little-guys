import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_LIGHTING_SUN, UI_LIGHTING_MOON, UI_LIGHTING_WATER, UI_LIGHTING_ROCK, UI_LIGHTING_PLANT, UI_LIGHTING_DECAY, UI_SM_LIGHTING, UI_SOIL_COMPOSITION, UI_CENTER } from "../UIData.js";

export class LightingComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let container = new Container(this.window, 0, 0);
        this.window.container = container;

        var sizeX = getBaseUISize() * 12;

        let leftContainer = new Container(this.window,  padding, 1);
        let rightContainer = new Container(this.window, padding, 1);

        container.addElement(leftContainer);
        container.addElement(rightContainer);

        leftContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "sun"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_SUN, sizeX,  35, .329 / 4, .329 * 4, () => getActiveClimate().getUIColorTransient()));

        rightContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "moon"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_MOON, sizeX,  35, .005, 1, () => getActiveClimate().getUIColorTransient()));

        leftContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "water"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER, sizeX,  35, 0.01, 2, () => getActiveClimate().getUIColorTransient()));

        rightContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "rock"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_ROCK, sizeX,  35, 0.1, 10, () => getActiveClimate().getUIColorTransient()));

        leftContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "plant"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_PLANT, sizeX,  35, 0.1, 10, () => getActiveClimate().getUIColorTransient()));

        rightContainer.addElement(new Text(this.window, sizeX,  getBaseUISize() * 1.5, UI_CENTER, "decay"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_DECAY, sizeX,  35, 0.5, 200, () => getActiveClimate().getUIColorTransient()));
    }
}