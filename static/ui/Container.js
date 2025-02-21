import { WindowElement } from "./Window.js";

export class Container {
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
    }

    addElement(newElement) {
        this.elements.push(newElement);
    }

    size() {
        return [this.sizeX, this.sizeY];
    }

    render(startX, startY) {
        var curX = startX;
        var curY = startY;

        this.endX = 0;
        this.endY = 0;

        this.elements.forEach((el) => {
            let elSize = el.size()
            if (elSize[0] == 0) {
                return;
            }
            el.render(curX, curY);
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
        
        var curX1 = 0;
        var curY1 = 0;
        var curX2, curY2;

        if (!(this.elements.some((el) => {
            let elSize = el.size();
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