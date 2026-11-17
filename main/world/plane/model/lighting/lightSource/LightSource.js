import { rgbToRgba } from "../../../../../color/color.js";
import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarCopy, multiplyVectorByScalarDest, subtractVectors, subtractVectorsDest } from "../../../../../util/vector.js";

export class LightSource {
    constructor(id, config) {
        this.id = id;
        this.color = structuredClone(config.colorConfig.rgbaArr);
        this.renderColor = rgbToRgba(...this.color, 0.1);
        this.init = 0;

        this.radSquared = 500;
    }

    calculateLighting(box, tickBox, dest) {
        return multiplyVectorByScalarDest(this.color, this.color[3] / (30 * Math.max(16, getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1))), dest)
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
            targetIter = plane.newBoxes;
        } else {
            targetIter = plane.tickBoxes;
            this.init = 1;
        }

        targetIter.forEach((tickBox) => {
            if (getDist(tickBox.posX, tickBox.posY, box.posX, box.posY, 1) > this.radSquared)
                return;

            tickBox.lightingSource.getOrInsert(this.id, [0, 0, 0])
            tickBox.lightingSourcePrev.getOrInsert(this.id, [0, 0, 0])
            tickBox.lightingSourceDelt.getOrInsert(this.id, [0, 0, 0])

            this.calculateLighting(box, tickBox, tickBox.lightingSource.get(this.id));

            subtractVectorsDest(tickBox.lightingSource.get(this.id), tickBox.lightingSourcePrev.get(this.id), tickBox.lightingSourceDelt.get(this.id));
            copyVecValue(tickBox.lightingSource.get(this.id), tickBox.lightingSourcePrev.get(this.id));
            addVectors(tickBox.lighting, tickBox.lightingSourceDelt.get(this.id))
        });
    }
    render(planeManager, box) {
        if ((planeManager.mcc.live.visibilityMask & 2) == 2) {
            planeManager.canvasManager.context.fillStyle = this.renderColor;
            planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
        }
    }
}