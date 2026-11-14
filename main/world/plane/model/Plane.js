import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
        this.tickBoxes = [];
        this.newBoxes = new Set();
    }

    getBox(px, py, create = false) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        if (create && this.boxes.get(px).get(py) == null) {
            this._b = new Box(px, py);
            this.boxes.get(px).set(py, this._b);
            this.newBoxes.add(this._b);
        } else {
            this._b = this.boxes.get(px).get(py);
            if (this._b && this.planeManager.mainManager.timeManager.curDay - this._b._ltt > this.planeManager.mainManager.timeManager.dt) {
                this.newBoxes.add(this._b);
            }
        }
        return this._b
    }

    update() {
        this.updateTickBoxes();
        this.updateBoxes();
        this.newBoxes.clear();
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
                    this.lightingHash |= (b.lightingSource.length * i * j);
                }
            }
        }
    }

    updateBoxes() {
        this.tickBoxes.forEach((b) => {
            if (b.lightingHash != this.lightingHash) {
                this.newBoxes.add(b);
            };
            b.update(this);
        });
    }

    render() {
        this.tickBoxes.forEach((b) => b.render(this.planeManager));
    }
}