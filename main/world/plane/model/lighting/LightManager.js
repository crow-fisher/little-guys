import { multiplyVectorByScalarCopy } from "../../../../util/vector.js";

export class LightManager {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.boxes = new Map();
        this.tickBoxes = [];
    }

    render(boxes) {
        boxes.forEach((box) => box.lighting = multiplyVectorByScalarCopy([1, 1, 1], .8 + .1 * Math.sin(Date.now() / 100 + .05 * ((box.posX ** 2 + box.posY ** 2)))));
    }

}