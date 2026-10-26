import { Box } from "./Box.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.boxes = new Map();
        this.offsetX = 0;
        this.offsetY = 0;
        this.blockSize = 8;
    }

    addSquare(square, px, py) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box());
        this.boxes.get(px).get(py).addSquare(square);
    }

    render() {
        for (let i = 0; i < 1000; i++) {
            for (let j = 0; j < 1000; j++) {
                let b = this.boxes.get(i)?.get(j);
                if (b != null) {
                    b.render(this.manipulationManager.canvasManager, i * this.blockSize + this.offsetX, j * this.blockSize + this.offsetY, this.blockSize);
                }
            }
        }
    }

}