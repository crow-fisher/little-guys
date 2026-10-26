import { Box } from "./Box.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.boxes = new Map();
        this.offsetX = 0;
        this.offsetY = 0;
    }

    addSquare(square, px, py) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box());
        this.boxes.get(px).get(py).addSquare(square);
    }

    render() {
        for (let i = 0; i < this.manipulationManager.canvasManager.canvas.width; i++) {
            if (this.boxes.get(i - this.offsetX) == null)
                continue;
            for (let j = 0; j < this.manipulationManager.canvasManager.canvas.height; j++) {
                let b = this.boxes.get(i - this.offsetX)?.get(j - this.offsetY);
                b?.render(this.manipulationManager.canvasManager, i, j, 16);
            }
        }
    }
}