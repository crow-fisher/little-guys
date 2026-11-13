import { rgbToRgba } from "../../../../../color/color.js";
import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarCopy, multiplyVectorByScalarDest, subtractVectors, subtractVectorsDest } from "../../../../../util/vector.js";

export class LightSource {
    constructor(id, config) {
        this.id = id;
        this.color = structuredClone(config.colorConfig.rgbaArr);
        this.renderColor = rgbToRgba(...this.color, 0.1);
        this.init = 0;
    }

    calculateLighting(box, tickBox, dest) {
        return multiplyVectorByScalarDest(this.color, this.color[3] / (30 * getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1)), dest)
    }

    destroy(plane) {
        plane.tickBoxes.forEach((tickBox) => {
            subtractVectors(tickBox.lighting, tickBox.lightingSource[this.id])
        });
    }

    update(plane, box) {
        let targetIter;
        if (this.init) {
            targetIter = plane.newBoxes;
        } else {
            targetIter = plane.tickBoxes;
            this.init = 1;
        }

        targetIter.forEach((tickBox) => {
            tickBox.lightingSource[this.id] = tickBox.lightingSource[this.id] ?? [0, 0, 0];
            tickBox._lightingSourcePrev[this.id] = tickBox._lightingSourcePrev[this.id] ?? [0, 0, 0];
            tickBox._lightingSourceDelt[this.id] = tickBox._lightingSourceDelt[this.id] ?? [0, 0, 0];
            this.calculateLighting(box, tickBox, tickBox.lightingSource[this.id]);

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