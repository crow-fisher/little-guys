
export class Box {
    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;
        this.lightSource = null;
        this.lightingSource = [];
        this.lighting = [0, 0, 0];
        this.squares = [];
        this.lastTouched = Date.now();
        this._lightingSourcePrev = [];
        this._lightingSourceDelt = [];        
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
    nbLeft(plane, create=false) {
        return plane.getBox(this.posX - 1, this.posY, create)
    }
    nbRight(plane, create=false) {
        return plane.getBox(this.posX + 1, this.posY, create)
    }
    nbBot(plane, create=false) {
        return plane.getBox(this.posX, this.posY + 1, create)
    }

}