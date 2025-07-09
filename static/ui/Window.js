import { getBaseUISize, getCanvasHeight, getCanvasWidth } from "../canvas.js";
import { getActiveClimate } from "../climate/climateManager.js";
import { COLOR_BLACK } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getLastMoveOffset, isLeftMouseClicked } from "../mouse.js";

export class Window {
    constructor(posX, posY, padding, dir, grounded, renderBackground=true) {
        this.container = null;
        this.posX = posX;
        this.posY = posY;
        this.padding = padding;
        this.grounded = grounded;
        this.renderBackground = renderBackground;

        this.sizeX = 0;
        this.sizeY = 0;
        this.endX = posX;
        this.endY = posY;
        this.dir = dir;

        this.hovered = false;
        this.clicked = false;
        this.locked = false;

        this.clickStartX = -1;
        this.clickStartY = -1;
    }

    render() {
        this.renderWindowFrame();
        let containerSize = this.container.size();
        this.sizeX = containerSize[0];
        this.sizeY = containerSize[1];
        this.container.render(this.posX, this.posY);
        this.renderWindowBorder()
    }

    renderWindowBorder() {
        if (!this.renderBackground)
            return;
        let size = getBaseUISize() * 0.8;

        let py = this.posY + this.sizeY;
        let my = getCanvasHeight() * 1.5;

        let yFactor = ((my - py) / my);
        let sizeYProcessed = size * yFactor;

        let px = this.posX + this.sizeX;
        let mx = getCanvasWidth() * 1.5; 
        let xFactor = (((mx - px) / mx));
        let sizeXProcessed = size * xFactor;

        MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(.95);

        // bottom rectangle
        MAIN_CONTEXT.fillRect(
            this.posX,
            this.posY + this.sizeY,
            this.sizeX,
            sizeYProcessed
        );
        // bottom triangle

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX, this.posY + this.sizeY + sizeYProcessed);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
        MAIN_CONTEXT.closePath();
        MAIN_CONTEXT.fill();

        // right side

        MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom((.83 - (xFactor * 0.1)));
        MAIN_CONTEXT.fillRect(
            this.posX + this.sizeX,
            this.posY,
            sizeXProcessed,
            this.sizeY
        );

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY);
        MAIN_CONTEXT.lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
        MAIN_CONTEXT.closePath();
        MAIN_CONTEXT.fill();
    }

    update() {
        let curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        let x = curMouseLocation.x;
        let y = curMouseLocation.y;
        
        let relX = x - this.posX;
        let relY = y - this.posY;

        if (relX > 0 && relX < this.sizeX && relY > 0 && relY < this.sizeY) {
            this.container.hover(relX, relY);
        }
        this.hoverWindowFrame(x, y);
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

    hoverWindowFrame(x, y) {
        if (this.locked || this.grounded) {
            return;
        }

        let hoverP = this.padding * 2;
        if (
            x < this.posX - hoverP ||
            x > this.posX + this.sizeX + hoverP || 
            y < this.posY - hoverP || 
            y > this.posY + this.sizeY + hoverP 
        ) {
            return;
        }
        this.hovered = true;

        if (isLeftMouseClicked()) {
            if (this.clicked) {
                this.posX = Math.max(0, Math.min(getCanvasWidth() - this.sizeX, x - this.clickStartX));
                this.posY = Math.max(getBaseUISize() * 3, Math.min(getCanvasHeight() - this.sizeY, y - this.clickStartY));
            } else {
                this.clicked = true;
                this.clickStartX = x - this.posX;
                this.clickStartY = y - this.posY;
            }
        } else {
            this.clicked = false;
        }

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