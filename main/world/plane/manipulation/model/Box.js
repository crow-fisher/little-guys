
export class Box {
    constructor() {
        this.squares = [];
    }

    addSquare(square) {
        this.squares.push(square);
    }

    render(canvasManager, posX, posY, sizeX) {
        this.squares.forEach((sq) => sq.render(canvasManager, posX, posY, sizeX))
    }
}