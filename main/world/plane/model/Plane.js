import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager, lightManager) {
        this.planeManager = planeManager;
        this.lightManager = lightManager;
        this.boxes = new Map();
        this.tickBoxes = [];
        
        this.newBoxes = new Set();
        this.newLightSources = new Set();
    }

    getBox(px, py, create = false) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        if (create && this.boxes.get(px).get(py) == null) {
            let newBox = new Box(px, py);
            this.boxes.get(px).set(py, newBox);
            this.newBoxes.add(newBox);
        }
        return this.boxes.get(px).get(py);
    }

    update() {
        this.updateTickBoxes();
        this.updateBoxes();
        // now here, newBoxes and newLightSources are both valid and filled with our new of each of them
        this.lightManager.update(this.tickBoxes);
    }

    updateTickBoxes() {
        this.tickBoxes.length = 0;
        for (let i = this.planeManager.cameraManager.windowWidthStart; i <= this.planeManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.planeManager.cameraManager.windowHeightEnd; j >= this.planeManager.cameraManager.windowHeightStart; j--) {
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
        this.lightManager.render(this.tickBoxes);
        this.tickBoxes.forEach((b) => b.render(this.planeManager));
    }
}