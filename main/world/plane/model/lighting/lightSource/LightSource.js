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
        return multiplyVectorByScalarDest(this.color, this.color[3] / (30 * Math.max(16, getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1))), dest)
    }

    destroy(plane) {
        plane.tickBoxes.forEach((tickBox) => {
            subtractVectors(tickBox.lighting, tickBox.lightingSource[this.id]);
            tickBox.lightingSource[this.id] = null;
            tickBox._lightingSourcePrev[this.id] = null;
            tickBox._lightingSourceDelt[this.id] = null;
        });
    }

    update(plane, box) {

    }

    render(planeManager, box) {
        if ((planeManager.mcc.live.visibilityMask & 2) == 2) {
            planeManager.canvasManager.context.fillStyle = this.renderColor;
            planeManager.canvasManager.renderSquare2D(box.posX, box.posY, 1, 1);
        }
    }
}