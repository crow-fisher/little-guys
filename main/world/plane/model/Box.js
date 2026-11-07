
export class Box {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        
        this.squares = [];
        this.lastTouched = Date.now();
    }

    update(planeManager) {
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.update(planeManager);
        }
    }

    render(planeManager) {
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.render(planeManager);
        }
    }
}