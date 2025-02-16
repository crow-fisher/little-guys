import { COLOR_OTHER_BLUE, COLOR_RED } from "../colors.js";
import { getLastMoveOffset, MAIN_CONTEXT } from "../index.js";

export class Window {
    constructor(posX, posY, dir) {
        this.clickElements = new Array();
        this.elements = new Array();
        this.posX = posX;
        this.posY = posY;
        this.dir = dir;
    }

    addElement(newElement) {
        this.elements.push(newElement);
        if (newElement.handleClick) {
            this.clickElements.push(newElement);
        }
    }

    removeElement(elementToRemove) {
        this.elements = Array.from(this.elements.filter((el) => el != elementToRemove));
        this.clickElements = Array.from(this.clickElements.filter((el) => el != elementToRemove));
    }

    render() {
        var curX = this.posX;
        var curY = this.posY;
        this.elements.forEach((el) => {
            el.render(curX, curY);
            if (this.dir == 0)
                curX += el.sizeX;
            else
                curY += el.sizeY;
        });
    }

    update() {
        var curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        var x = curMouseLocation.x;
        var y = curMouseLocation.y;

        var curX1 = this.posX;
        var curY1 = this.posY;
        var curX2, curY2;
        this.elements.forEach((el) => {
            curX2 = curX1 + el.sizeX;
            curY2 = curY1 + el.sizeY;
            if (x > curX1 && x < curX2 && y > curY1 && y < curY2) {
                el.hover(x - curX1, y - curY1);
            }
            if (this.dir == 0)
                curX1 = curX2;
            else
                curY1 = curY2;

        });

    }
}

export class WindowElement { 
    constructor(sizeX, sizeY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    render(startX, startY) {}

    hover(posX, posY) {}
}