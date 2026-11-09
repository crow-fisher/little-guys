
export class Box {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        
        this.squares = [];
        this.lastTouched = Date.now();
    }

    nbLeft(plane, create=false) {
        return plane.getBox(this.posX - 1, this.posY, create)
    }
    nbRight(plane, create=false) {
        return plane.getBox(this.posX + 1, this.posY, create)
    }
    nbBot(plane, create=false) {
        return plane.getBox(this.posX, this.posY + 1, create)
    }

    update(plane) {
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.update(this, plane);
        }
    }

    render(plane) {
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.render(plane);
        }
    }
}