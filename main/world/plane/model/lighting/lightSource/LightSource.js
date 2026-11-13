import { rgbToRgba } from "../../../../../color/color.js";
import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarCopy, subtractVectorsDest } from "../../../../../util/vector.js";

export class LightSource {
    constructor(id, config) {
        this.id = id;
        this.color = structuredClone(config.colorConfig.rgbaArr);
        this.renderColor = rgbToRgba(...this.color);
    }

    calculateLighting(box, tickBox) {
        return multiplyVectorByScalarCopy(this.color, this.color[3] / (30 * getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1)))
    }

    update(plane, box) {
        if (Math.random() < .95)
            return;

        plane.newBoxes.forEach((newBox) => {
            newBox.lightingSource[this.id] = newBox.lightingSource[this.id] ?? [0, 0, 0]; 
            newBox._lightingSourcePrev[this.id] = newBox._lightingSourcePrev[this.id] ?? [0, 0, 0];
            newBox._lightingSourceDelt[this.id] = newBox._lightingSourceDelt[this.id] ?? [0, 0, 0]; 
            newBox.lightingSource[this.id] = this.calculateLighting(box, newBox);

            subtractVectorsDest(newBox.lightingSource[this.id], newBox._lightingSourcePrev[this.id], newBox._lightingSourceDelt[this.id]);
            copyVecValue(newBox.lightingSource[this.id], newBox._lightingSourcePrev[this.id]);
            addVectors(newBox.lighting, newBox._lightingSourceDelt[this.id])
        });
    }

    render(planeManager, box) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
    }
}