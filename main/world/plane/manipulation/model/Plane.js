import { Box } from "./Box.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.boxes = new Map();
        this.offsetX = 0;
        this.offsetY = 0;
    }

    addSquare(square) {
        let px = Math.round(square.posX), py = Math.round(square.posY);
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box());
        this.boxes.get(px).get(py).addSquare(square);
    }

    render() {
        this.renderSquares = this.renderSquares ?? [];
        this.renderSquares.length = 0;
        for (let i = 0; i < this.manipulationManager.canvasManager.canvas.width; i++) {
            if (this.boxes.get(i - this.offsetX) == null)
                continue;
            for (let j = 0; j < this.manipulationManager.canvasManager.canvas.height; j++) {
                let b = this.boxes.get(i - this.offsetX)?.get(j - this.offsetY);
                
                if (b) {
                    this.renderSquares.push(b);
                }
            }
        }
        this.renderSquares.sort((a, b) => a.lastTouched - b.lastTouched);
        this.renderSquares.forEach((b) => b.render(this.manipulationManager.canvasManager, 16));
    }
}