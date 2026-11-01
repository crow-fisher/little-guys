
export class Box {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        
        this.squares = [];
        this.lastTouched = Date.now();
        this.sqStatic = null;
    }

    render(canvasManager, ox, oy) {
        this.sqStatic?.render(canvasManager, ox, oy);
    }
}