import { COLOR_BLACK, COLOR_BROWN, COLOR_OTHER_BLUE, COLOR_RED } from "../colors.js";
import { getLastMoveOffset, isLeftMouseClicked, MAIN_CONTEXT } from "../index.js";
import { setWindowHovered } from "./WindowManager.js";

export class Window {
    constructor(posX, posY, padding, dir) {
        this.clickElements = new Array();
        this.elements = new Array();
        this.posX = posX;
        this.posY = posY;
        this.padding = padding;

        this.sizeX = 0;
        this.sizeY = 0;
        this.endX = posX;
        this.endY = posY;
        this.dir = dir;

        this.clicked = false;

        this.clickStartX = -1;
        this.clickStartY = -1;
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
        this.sizeX = this.endX - this.posX;
        this.sizeY = this.endY - this.posY;


    }

    update() {
        var curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        var x = curMouseLocation.x;
        var y = curMouseLocation.y;

        this.hoverWindowFrame(x, y);

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
                curX1 = curX2 + this.padding;
            else
                curY1 = curY2 + this.padding;
        });
    }

    renderWindowFrame() {
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(
            this.posX - this.padding, this.posY - this.padding, 
            this.sizeX + this.padding * 2, 
            this.sizeY + this.padding * 2);
    }

    hoverWindowFrame(x, y) {
        if (
            x < this.posX - this.padding ||
            x > this.posX + this.sizeX + this.padding || 
            y < this.posY - this.padding || 
            y > this.posY + this.sizeY + this.padding 
        ) {
            return;
        }
        setWindowHovered();

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
    constructor(sizeX, sizeY) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }

    render(startX, startY) {}

    hover(posX, posY) {
        setWindowHovered();
    }
}