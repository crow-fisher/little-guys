import { COLOR_BLACK } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getLastMoveOffset, isLeftMouseClicked } from "../mouse.js";

export class Window {
    constructor(posX, posY, padding, dir, grounded) {
        this.container = null;
        this.posX = posX;
        this.posY = posY;
        this.padding = padding;
        this.grounded = grounded;

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
    }

    update() {
        var curMouseLocation = getLastMoveOffset();
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

        var hoverP = this.padding * 2;
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
                this.posX = x - this.clickStartX;
                this.posY = y - this.clickStartY;
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
    constructor(window, key, sizeX, sizeY) {
        this.window = window;
        this.key = key;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
    render(startX, startY) {}

    hover(posX, posY) {
        this.window.hovered = true;
    }
    size() {
        return [this.sizeX, this.sizeY];
    }
}