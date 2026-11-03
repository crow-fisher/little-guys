import { Box } from "./Box.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.boxes = new Map();
        this.tickBoxes = [];
    }

    getBox(px, py, _px = Math.floor(px), _py = Math.floor(py)) {
        this.boxes.set(_px, this.boxes.get(_px) ?? new Map());
        this.boxes.get(_px).set(_py, this.boxes.get(_px).get(_py) ?? new Box(_px, _py));
        return this.boxes.get(_px).get(_py);
    }

    update() {
        this.tickBoxes.length = 0;
        for (let i = this.manipulationManager.cameraManager.windowWidthStart; i <= this.manipulationManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.manipulationManager.cameraManager.windowHeightStart; j <= this.manipulationManager.cameraManager.windowHeightEnd; j++) {
                let b = this.boxes.get(i)?.get(j);
                if (b) {
                    this.tickBoxes.push(b);
                }
            }
        }
    }

    render() {
        this.tickBoxes.forEach((b) => b.render(this.manipulationManager.canvasManager));
    }
}