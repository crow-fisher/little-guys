export class WindowElement { 
    constructor(window, sizeX, sizeY) {
        this.window = window;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
    updateSizeXByMult(muit) {
        this.sizeX *= muit;
    }
    updateSizeX(sizeX) {
        this.sizeX = sizeX;
    }
    updateSizeY(sizeY) {
        this.sizeY = sizeY;
    }
    render(startX, startY) {}

    hover(posX, posY) {
        this.hovered = true;
    }
    size() {
        return [this.sizeX, this.sizeY];
    }
}