import { getBaseUISize, getCanvasHeight, getCanvasWidth } from "../canvas.js";
import { getActiveClimate } from "../climate/climateManager.js";
import { COLOR_BLACK } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getLastMoveOffset, isLeftMouseClicked } from "../mouse.js";
import { Window } from "./Window.js";

export class WorldPanWindow extends Window {
    constructor(posX, posY, padding, dir, grounded, renderBackground) {
        super(posX, posY, padding, dir, grounded, renderBackground);
        this.mouseOffsetY = () => 0;
    }
    update() {
        let curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null || !isLeftMouseClicked()) {
            return;
        }
        let x = curMouseLocation.x;
        let y = curMouseLocation.y;
        
        let relX = x - this.posX;
        let relY = y - (this.posY + this.mouseOffsetY());

        if (relX > 0 && relX < this.sizeX && relY > 0 && relY < this.sizeY) {
            this.container.hover(relX, relY);
        }
    }

    renderWindowFrame() {
        if (!this.renderBackground)
            return;
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(
            this.posX - this.padding, this.posY - this.padding, 
            this.sizeX + this.padding * 2, 
            this.sizeY + this.padding * 2);
    }
}

export class WindowElement { 
    constructor(window, sizeX, sizeY) {
        this.window = window;
        this.sizeX = Math.floor(sizeX);
        this.sizeY = Math.floor(sizeY);
    }
    render(startX, startY) {}

    hover(posX, posY) {
        this.hovered = true;
    }
    size() {
        return [this.sizeX, this.sizeY];
    }
}