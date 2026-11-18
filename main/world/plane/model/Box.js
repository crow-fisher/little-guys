
export class Box {
    constructor(bid, posX, posY) {
        this.bid = bid;
        this.posX = posX;
        this.posY = posY;
        this.lightSource = null;
        this.lightingSource = new Map();
        this.lightingSourcePrev = new Map();
        this.lightingSourceDelt = new Map();
        this.lighting = [.3, .3, .3];
        this.squares = [];
        this.lastTouched = Date.now();

    }
    update(plane) {
        this._ltt = plane.planeManager.mainManager.timeManager.curDate;
        this.lightingHash = plane.lightingHash;
        this.lightSource?.update(plane, this);
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.update(this, plane);
        }
    }
    render(planeManager) {
        for (let i = 0; i < this.squares.length; i++) {
            this.squares.at(i)?.render(planeManager);
        }
        this.lightSource?.render(planeManager, this);
    }
    nbLeft(plane, create = false) {
        return plane.getBox(this.posX - 1, this.posY, create)
    }
    nbRight(plane, create = false) {
        return plane.getBox(this.posX + 1, this.posY, create)
    }
    nbBot(plane, create = false) {
        return plane.getBox(this.posX, this.posY + 1, create)
    }

}