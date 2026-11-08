import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
        this.tickBoxes = [];
    }

    getBox(px, py, _px = Math.floor(px), _py = Math.floor(py)) {
        this.boxes.set(_px, this.boxes.get(_px) ?? new Map());
        this.boxes.get(_px).set(_py, this.boxes.get(_px).get(_py) ?? this.newBox(_px, _py));
        return this.boxes.get(_px).get(_py);
    }

    newBox(px, py) {
        let box = new Box(px, py); 
        // box.nbTopTop = this.getBox(px, py + 2)
        // box.nbTop = this.getBox(px, py + 1)
        // box.nbLeft = this.getBox(px - 1, py)
        // box.nbRight = this.getBox(px + 1, py)
        // box.nbBot = this.getBox(px, py - 1)
        return box;
    }

    update() {
        this.updateTickBoxes();
    }

    updateTickBoxes() {
        this.tickBoxes.length = 0;
        for (let i = this.planeManager.cameraManager.windowWidthStart; i <= this.planeManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.planeManager.cameraManager.windowHeightStart; j <= this.planeManager.cameraManager.windowHeightEnd; j++) {
                let b = this.boxes.get(i)?.get(j);
                if (b) {
                    this.tickBoxes.push(b);
                }
            }
        }
    }

    updateBoxes() {
        this.tickBoxes.forEach((b) => b.update(this.planeManager));
    }

    render() {
        this.tickBoxes.forEach((b) => b.render(this.planeManager));
    }
}