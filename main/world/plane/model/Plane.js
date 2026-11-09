import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
        this.tickBoxes = [];
    }

    getBox(px, py, create=false) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        if (create)
            this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box(px, py));
        
        return this.boxes.get(px).get(py);
    }

    update() {
        this.updateTickBoxes();
        this.updateBoxes();
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
        this.tickBoxes.forEach((b) => b.update(this));
    }

    render() {
        this.tickBoxes.forEach((b) => b.render(this.planeManager));
    }
}