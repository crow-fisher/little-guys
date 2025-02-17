import { WindowElement } from "./Window.js";

export class Container extends WindowElement {
    constructor(window, key, sizeX, sizeY, padding, dir) {
        super(window, key, sizeX, sizeY);

        this.elements = new Array();
        this.padding = padding;

        this.sizeX = 0;
        this.sizeY = 0;
        this.endX = 0;
        this.endY = 0;
        this.dir = dir;

        this.clickStartX = -1;
        this.clickStartY = -1;
    }

    addElement(newElement) {
        this.elements.push(newElement);
    }

    render(startX, startY) {
        var curX = startX;
        var curY = startY;

        this.endX = 0;
        this.endY = 0;

        this.elements.forEach((el) => {
            el.render(curX, curY);
            this.endX = Math.max(curX + el.sizeX, this.endX);
            this.endY = Math.max(curY + el.sizeY, this.endY);
            if (this.dir == 0) {
                curX += el.sizeX + this.padding;
            } else {
                curY += el.sizeY + this.padding;
            }
        });
        this.sizeX = this.endX - startX;
        this.sizeY = this.endY - startY;

        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        this.window.hovered = true;
        
        var curX1 = 0;
        var curY1 = 0;
        var curX2, curY2;

        if (!(this.elements.some((el) => {
            curX2 = curX1 + el.sizeX;
            curY2 = curY1 + el.sizeY;
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