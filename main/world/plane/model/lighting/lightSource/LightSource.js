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

    addBox(box, tickBox) {
        tickBox.lightingSource[this.id] = tickBox.lightingSource[this.id] ?? [0, 0, 0]; 
        tickBox._lightingSourcePrev[this.id] = tickBox._lightingSourcePrev[this.id] ?? [0, 0, 0];
        tickBox._lightingSourceDelt[this.id] = tickBox._lightingSourceDelt[this.id] ?? [0, 0, 0]; 
        tickBox.lightingSource[this.id] = this.calculateLighting(box, tickBox);
    }

    update(plane, box) {
        if (Math.random() < .95)
            return;

        plane.tickBoxes.forEach((tickBox) => {
            tickBox.lightingSource[this.id] = tickBox.lightingSource[this.id] ?? [0, 0, 0]; 
            tickBox._lightingSourcePrev[this.id] = tickBox._lightingSourcePrev[this.id] ?? [0, 0, 0];
            tickBox._lightingSourceDelt[this.id] = tickBox._lightingSourceDelt[this.id] ?? [0, 0, 0]; 
            tickBox.lightingSource[this.id] = this.calculateLighting(box, tickBox);

            subtractVectorsDest(tickBox.lightingSource[this.id], tickBox._lightingSourcePrev[this.id], tickBox._lightingSourceDelt[this.id]);
            copyVecValue(tickBox.lightingSource[this.id], tickBox._lightingSourcePrev[this.id]);
            addVectors(tickBox.lighting, tickBox._lightingSourceDelt[this.id])
        });
    }

    render(planeManager, box) {
        planeManager.canvasManager.context.fillStyle = this.renderColor;
        planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
    }
}