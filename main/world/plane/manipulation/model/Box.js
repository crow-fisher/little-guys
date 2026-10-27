
export class Box {
    constructor() {
        this.squares = [];
        this.lastTouched = Date.now();
    }

    addSquare(square) {
        this.squares.push(square);
        this.lastTouched = Date.now();
    }

    render(canvasManager, posX, posY, sizeX) {
        this.squares.forEach((sq) => sq.render(canvasManager, posX, posY, sizeX))
    }
}