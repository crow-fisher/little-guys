import { getBaseUISize, getCanvasHeight, getCanvasWidth } from "../../canvas.js";
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
            let size = getBaseUISize() * 1;

            let py = this.window.posY + this.window.sizeY;
            let my = getCanvasHeight() * 0.9;
            if (py > my) {
                return;
            }

            let yFactor = ((my - py) / my);
            let sizeYProcessed = size * yFactor;

            let px = this.window.posX + this.window.sizeX;
            let mx = getCanvasWidth() * 0.5; 
            if (px > mx) {
                return;
            }
            let xFactor =  0.5 + (((mx - px) / mx)) / 2;
            let sizeXProcessed = size * xFactor;

            MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(.95);

            // bottom rectangle
            MAIN_CONTEXT.fillRect(
                this.window.posX,
                this.window.posY + this.window.sizeY,
                this.window.sizeX,
                sizeYProcessed
            );
            // bottom triangle

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(this.window.posX + this.window.sizeX, this.window.posY + this.window.sizeY);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX + sizeXProcessed, this.window.posY + this.window.sizeY + sizeYProcessed);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX, this.window.posY + this.window.sizeY + sizeYProcessed);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX, this.window.posY + this.window.sizeY);
            MAIN_CONTEXT.closePath();
            MAIN_CONTEXT.fill();

            // right side

            MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(0.75);
            MAIN_CONTEXT.fillRect(
                this.window.posX + this.window.sizeX,
                this.window.posY,
                sizeXProcessed,
                this.window.sizeY
            );

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(this.window.posX + this.window.sizeX, this.window.posY + this.window.sizeY);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX + sizeXProcessed, this.window.posY + this.window.sizeY + sizeYProcessed);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX + sizeXProcessed, this.window.posY + this.window.sizeY);
            MAIN_CONTEXT.lineTo(this.window.posX + this.window.sizeX, this.window.posY + this.window.sizeY);
            MAIN_CONTEXT.closePath();
            MAIN_CONTEXT.fill();
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