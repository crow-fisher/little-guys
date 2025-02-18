import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_LIGHTING_SUN, UI_LIGHTING_MOON, UI_LIGHTING_WATER, UI_LIGHTING_ROCK, UI_LIGHTING_PLANT, UI_LIGHTING_DECAY, UI_SM_LIGHTING, UI_SOIL_COMPOSITION } from "../UIData.js";


let padding = 10;
export class LightingComponent extends Component {
    constructor() {
        super();

        var sizeX = 100;

        let leftContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);
        let rightContainer = new Container(this.window, UI_SOIL_COMPOSITION, sizeX, 100, padding, 1);

        this.window.addElement(leftContainer);
        this.window.addElement(rightContainer);

        leftContainer.addElement(new Text(this.window, sizeX,  15, "sun"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_SUN, sizeX,  35, .129 / 4, .129 * 4));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "moon"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_MOON, sizeX,  35, .005, .1));

        leftContainer.addElement(new Text(this.window, sizeX,  15, "water"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_WATER, sizeX,  35, 0.1, 10));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "rock"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_ROCK, sizeX,  35, 0.1, 10));

        leftContainer.addElement(new Text(this.window, sizeX,  15, "plant"));
        leftContainer.addElement(new Slider(this.window, UI_LIGHTING_PLANT, sizeX,  35, 0.1, 10));

        rightContainer.addElement(new Text(this.window, sizeX,  15, "decay"));
        rightContainer.addElement(new Slider(this.window, UI_LIGHTING_DECAY, sizeX,  35, .90, .9999));

    }

    render() {
        if (!loadUI(UI_SM_LIGHTING)) {
            return;
        }
        super.render();
    }
    
    update() {
        if (!loadUI(UI_SM_LIGHTING)) {
            return;
        }
        super.update();
    }
}