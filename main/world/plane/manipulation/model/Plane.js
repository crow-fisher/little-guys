import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
    }

    addSquare(square) {
        let px = Math.round(square.posX), py = Math.round(square.posY);
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box());

        this.boxes.get(px).get(py).addSquare(square, px, py);
    }

    getBox(px, py) {
        this.boxes.set(px, this.boxes.get(px) ?? new Map());
        this.boxes.get(px).set(py, this.boxes.get(px).get(py) ?? new Box());
        return this.boxes.get(px).get(py);
    }

    render() {
        this.renderBoxes = this.renderBoxes ?? [];
        this.renderBoxes.length = 0;
        for (let i = this.planeManager.cameraManager.windowWidthStart; i < this.planeManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.planeManager.cameraManager.windowHeightStart; j < this.planeManager.cameraManager.windowHeightEnd; j++) {
                let b = this.boxes.get(i)?.get(j);
                if (b) {
                    this.renderBoxes.push(b);
                }
            }
        }
        this.renderBoxes.sort((a, b) => a.lastTouched - b.lastTouched);
        this.renderBoxes.forEach((b) => b.render(this.planeManager.canvasManager));
    }
}