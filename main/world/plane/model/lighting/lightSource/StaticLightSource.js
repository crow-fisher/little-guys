import { addVectors, copyVecValue, subtractVectorsDest } from "../../../../../util/vector.js";
import { LightSource } from "./LightSource.js";

export class StaticLightSource extends LightSource {
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
}