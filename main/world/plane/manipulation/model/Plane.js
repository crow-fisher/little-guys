import { Box } from "./Box.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
    }

    getBox(px, py, _px=Math.floor(px), _py=Math.floor(py)) {
        this.boxes.set(_px, this.boxes.get(_px) ?? new Map());
        this.boxes.get(_px).set(_py, this.boxes.get(_px).get(_py) ?? new Box());
        return this.boxes.get(_px).get(_py);
    }

    render() {
        this.renderBoxes = this.renderBoxes ?? [];
        this.renderBoxes.length = 0;
        for (let i = this.planeManager.cameraManager.windowWidthStart; i <= this.planeManager.cameraManager.windowWidthEnd; i++) {
            if (this.boxes.get(i) == null)
                continue;
            for (let j = this.planeManager.cameraManager.windowHeightStart; j <= this.planeManager.cameraManager.windowHeightEnd; j++) {
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