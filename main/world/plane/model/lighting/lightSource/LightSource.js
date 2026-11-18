import { rgbToRgba } from "../../../../../color/color.js";
import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarCopy, multiplyVectorByScalarDest, subtractVectors, subtractVectorsDest } from "../../../../../util/vector.js";

export class LightSource {
    constructor(id, config) {
        this.id = id;
        this.color = structuredClone(config.colorConfig.rgbaArr);
        this.renderColor = rgbToRgba(...this.color, 0.1);
        this.init = 0;

        this.radSquared = 50000;
    }

    calculateLighting(box, tickBox) {
        return multiplyVectorByScalarDest(this.color, this.color[3] / (30 * Math.max(16, getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1))), tickBox.lightingSource.get(this.id));
    }

    destroy(plane) {
        plane.tickBoxes.forEach((tickBox) => {
            tickBox.lightingSource.delete(this.id);
            tickBox.lightingSourcePrev.delete(this.id);
            tickBox.lightingSourceDelt.delete(this.id);
        });
    }

    update(plane, box) {
        let targetIter;
        if (this.init) {
            targetIter = plane.dirtyBoxes;
        } else {
            targetIter = plane.tickBoxes;
            this.init = 1;
        }

        targetIter.forEach((tickBox) => {
            if (getDist(tickBox.posX, tickBox.posY, box.posX, box.posY, 1) > this.radSquared)
                return;

            tickBox.lightingSource.set(this.id, tickBox.lightingSource.get(this.id) ?? [0, 0, 0])
            tickBox.lightingSourcePrev.set(this.id, tickBox.lightingSourcePrev.get(this.id) ?? [0, 0, 0])
            tickBox.lightingSourceDelt.set(this.id, tickBox.lightingSourceDelt.get(this.id) ?? [0, 0, 0])

            this.calculateLighting(box, tickBox);

        });
    }
    render(planeManager, box) {
        if ((planeManager.mcc.live.visibilityMask & 2) == 2) {
            planeManager.canvasManager.context.fillStyle = this.renderColor;
            planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
        }
    }
}