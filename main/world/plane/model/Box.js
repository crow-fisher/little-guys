
export class Box {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        
        this.squares = [];
        this.lastTouched = Date.now();

        this.nbTopTop;
        this.nbTop;
        this.nbLeft;
        this.nbRight;
        this.nbBot;
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