import { getBaseSize, getCanvasWidth } from "../../canvas.js";
import { COLOR_BLACK } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { Time } from "./Time.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, 
    UI_SPEED_1,
UI_SPEED_2,
UI_SPEED_3,
UI_SPEED_4,
UI_SPEED_5,
UI_SPEED_6,
UI_SPEED_7,
UI_SPEED_8,
UI_SPEED_9,
UI_LIGHTING_SUN, UI_LIGHTING_MOON, UI_LIGHTING_WATER, UI_LIGHTING_ROCK, UI_LIGHTING_PLANT, UI_LIGHTING_DECAY, UI_SM_LIGHTING, UI_SOIL_COMPOSITION, UI_NULL, UI_TOPBAR, 
UI_SPEEDS,
UI_SPEED} from "../UIData.js";
import { TopBarToggle } from "./TopBarToggle.js";
import { getLastMoveOffset, isLeftMouseClicked } from "../../mouse.js";

export class TopBarComponent {
    constructor(key) {
        this.key = key;
        this.elements = new Map();
        this.elements[1] = [new Time(getBaseSize() * 2)];

        this.elements[0.75] = new Array();
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_1, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_2, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_3, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_4, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_5, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_6, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_7, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_8, "▶"));
        this.elements[0.75].push(new TopBarToggle(getBaseSize() * 2, UI_SPEED, UI_SPEED_9, "▶"));

        this.maxHeight = 0;
        this.padding = 4;
    }

    render() {
        if (!loadUI(this.key)) {
            return;
        }

        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(0, 0, getCanvasWidth(), this.maxHeight + 3 * this.padding);

        let keys = Object.keys(this.elements);
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = getCanvasWidth() * key;
            startX += (key > 0.5 ? -getBaseSize() : getBaseSize())

            elements.forEach((element) => {
                let measurements = element.measure();
                element.render(startX, this.padding + measurements[1]);
                startX += measurements[0] + this.padding;
                this.maxHeight = Math.max(measurements[1], this.maxHeight);
            })
        })
    }

    update() {
        if (!loadUI(this.key)) {
            return;
        }
        
        var curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        
        var x = curMouseLocation.x;
        var y = curMouseLocation.y;

        if (y > this.maxHeight) {
            return;
        }

        let keys = Object.keys(this.elements);
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = getCanvasWidth() * key;
            startX += (key > 0.5 ? -getBaseSize() : getBaseSize())
            elements.forEach((element) => {
                let measurements = element.measure();
                let width = measurements[0] + this.padding;
                if (x > startX - width && x < startX) {
                    element.hover(x - startX, y);
                }
                startX += width;
            });
        })

    }

}