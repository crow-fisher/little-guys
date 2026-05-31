export class WindowElement { 
    constructor(window, sizeX, sizeY) {
        this.window = window;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
    render(startX, startY) {}
    
    size() {
        return [this.sizeX(), this.sizeY()];
    }
    hover(posX, posY) {
        this.hovered = true;
    }

}