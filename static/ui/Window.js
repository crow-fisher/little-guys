import { COLOR_BLACK, COLOR_BROWN, COLOR_OTHER_BLUE, COLOR_RED } from "../colors.js";
import { getLastMoveOffset, MAIN_CONTEXT } from "../index.js";
import { setWindowHovered } from "./WindowManager.js";

export class Window {
    constructor(posX, posY, padding, dir) {
        this.clickElements = new Array();
        this.elements = new Array();
        this.posX = posX;
        this.posY = posY;
        this.padding = padding;

        this.endX = posX;
        this.endY = posY;
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
        this.renderWindowFrame();
        var curX = this.posX;
        var curY = this.posY;
        
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

    renderWindowFrame() {
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(
            this.posX - this.padding, this.posY - this.padding, 
            this.endX - this.posX + this.padding * 2, 
            this.endY - this.posY + this.padding * 2);
    }
}

export class WindowElement { 
    constructor(sizeX, sizeY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    render(startX, startY) {}

    hover(posX, posY) {
        setWindowHovered();
    }
}