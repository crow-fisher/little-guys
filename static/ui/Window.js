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

}

export class WindowElement { 
    constructor(sizeX, sizeY, handleClick) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.handleClick = handleClick;
    }

    render(startX, startY) {}
}