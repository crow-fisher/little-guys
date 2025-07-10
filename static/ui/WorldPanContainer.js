import { getTotalCanvasPixelHeight } from "../index.js";
import { getLastMoveEventTime, getLastMoveOffset } from "../mouse.js";
import { WindowElement } from "./Window.js";

export class WorldPanContainer {
    constructor(window, padding, dir) {
        this.window = window;
        this.elements = new Array();
        this.padding = padding;

        this.sizeX = 1;
        this.sizeY = 1;
        this.endX = 0;
        this.endY = 0;
        this.dir = dir;

        this.clickStartX = -1;
        this.clickStartY = -1;
        
        this.lastRenderOffset = 0;
        this.lastOpacity = 0;
        
        this.window.mouseOffsetY = () => -this.lastRenderOffset;

    }

    addElement(newElement) {
        this.elements.push(newElement);
    }

    size() {
        return [this.sizeX, this.sizeY];
    }

    render(startX, startY) {
        let lastMoveOffset = getLastMoveOffset();
        if (lastMoveOffset == null)
            return;
        let y = lastMoveOffset.y;
        let height = getTotalCanvasPixelHeight();

        if (lastMoveOffset == null || y > height || y < height / 2) {
            return;
        }

        let min = 0.75 * height;
        let max = 0.85 * height;

        if (y > max) {
            this.lastOpacity = 1;
        } else {
            this.lastOpacity = (y - min) / (max - min);
        }

        let moveHeight = 1.5 * this.sizeY;

        // exponential decay 
        let c1 = .01;
        let c2 = 12; 
        let t = Date.now() - getLastMoveEventTime();

        let expFrac = Math.max(0, 1 - Math.exp(c1 * t - c2));
        this.lastOpacity *= expFrac;
        this.lastRenderOffset = (this.lastRenderOffset *.90) + (.1 * moveHeight * this.lastOpacity);

        startY -= this.lastRenderOffset;

        let curX = startX;
        let curY = startY;

        this.endX = 0;
        this.endY = 0;

        this.elements.forEach((el) => {
            let elSize = el.size()
            if (elSize[0] == 0 || isNaN(elSize[0] || isNaN(elSize[1]))) {
                return;
            }
            el.render(curX, curY, this.lastOpacity);
            this.endX = Math.max(curX + elSize[0], this.endX);
            this.endY = Math.max(curY + elSize[1], this.endY);
            if (this.dir == 0) {
                curX += elSize[0] + this.padding;
            } else {
                curY += elSize[1] + this.padding;
            }
        });
        this.sizeX = this.endX - startX;
        this.sizeY = this.endY - startY;
    }

    hover(posX, posY) {
        this.window.hovered = true;
        
        let curX1 = 0;
        let curY1 = 0;
        let curX2, curY2;

        if (!(this.elements.some((el) => {
            let elSize = el.size();
            if (elSize[0] == 0) {
                return;
            }
            curX2 = curX1 + elSize[0];
            curY2 = curY1 + elSize[1];
            if (posX > curX1 && posX < curX2 && posY > curY1 && posY < curY2) {
                el.hover(posX - curX1, posY - curY1);
                return true;
            }
            if (this.dir == 0)
                curX1 = curX2 + this.padding;
            else
                curY1 = curY2 + this.padding;
        })));
    }

    
}