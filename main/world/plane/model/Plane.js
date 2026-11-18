import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
        this.bid = 0;
        this.tickBoxes = [];
        this.dirtyBoxes = new Set();
    }

    move(square, toBox, fromBox) {
        if (fromBox) {
            fromBox.squares[square.PID] = null;
            this.dirtyBoxes.add(fromBox);
            fromBox.lfrSquare -= square.lfr;
        }
        if (toBox && toBox.squares[square.PID] == null) {
            toBox.squares[square.PID] = square;
            this.dirtyBoxes.add(toBox);
            toBox.lfrSquare += square.lfr;
        } else {
            square.destroy();
        }
    }

    getBox(px, py, create = false) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        if (create && this.boxes.get(px).get(py) == null) {
            this._b = new Box(this.bid++, px, py);
            this.boxes.get(px).set(py, this._b);
            this.dirtyBoxes.add(this._b);
        } else {
            this._b = this.boxes.get(px).get(py);
            if (this._b && this.planeManager.mainManager.timeManager.curDay - this._b._ltt > this.planeManager.mainManager.timeManager.dt) {
                this.dirtyBoxes.add(this._b);
            }
        }
        return this._b
    }

    update() {
        this.updateTickBoxes();
        this.updateBoxes();
        this.dirtyBoxes.clear();
    }

    updateTickBoxes() {
        this.tickBoxes.length = 0;
        this.lightingHash = 0;
        for (let i = this.planeManager.cameraManager.windowWidthStart; i <= this.planeManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.planeManager.cameraManager.windowHeightEnd; j >= this.planeManager.cameraManager.windowHeightStart; j--) {
                let b = this.getBox(i, j);
                if (b) {
                    this.tickBoxes.push(b);
                    this.lightingHash |= (b.lightingSource.size * i * j);
                }
            }
        }
    }

    updateBoxes() {
        this.tickBoxes.forEach((b) => {
            if (b.lightingHash != this.lightingHash) {
                this.dirtyBoxes.add(b);
            };
            b.update(this);
        });
    }

    render() {
        this.tickBoxes.forEach((b) => b.render(this.planeManager));
    }
}