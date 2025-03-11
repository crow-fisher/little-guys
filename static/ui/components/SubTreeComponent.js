import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { MAIN_CONTEXT } from "../../index.js";
import { loadEmptyScene, loadSlot, saveSlot } from "../../saveAndLoad.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { Radio } from "../elements/Radio.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Text } from "../elements/Text.js";
import { loadUI, UI_DISPLAY_SIZEY, UI_LIGHTING_FASTUPDATERATE, UI_LIGHTING_SLOWUPDATERATE, UI_SIZE } from "../UIData.js";
import { Window } from "../Window.js";


export class SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        this.window = new Window(posXFunc(), posYFunc(), padding, dir, true);
        this.key = key;
        this.posXFunc = posXFunc;
        this.posYFunc = posYFunc;
    }

    render() {
        if (loadUI(this.key)) {
            this.window.render();
            let size = getBaseUISize() * 0.4;
            MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(0.99);
            MAIN_CONTEXT.fillRect(
                this.window.posX,
                this.window.posY + this.window.sizeY,
                this.window.sizeX + size,
                (size * 0.7)
            );

            MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(0.8);
            MAIN_CONTEXT.fillRect(
                this.window.posX + this.window.sizeX,
                this.window.posY,
                size,
                this.window.sizeY
            );
        }
    }

    update() {
        this.window.posX = this.posXFunc();
        this.window.posY = this.posYFunc();
        if (loadUI(this.key)) {
            this.window.update();
        }
    }
}