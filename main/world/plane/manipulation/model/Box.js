
export class Box {
    constructor() {
        this.squares = [];
        this.lastTouched = Date.now();
        this.sqStatic = null;
    }

    render(canvasManager, ox, oy) {
        this.sqStatic?.render(canvasManager, ox, oy);
    }
}