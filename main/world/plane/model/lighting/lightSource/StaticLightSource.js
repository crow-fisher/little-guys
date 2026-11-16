import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, getVec2Length, getVec2LengthSquared, subtractVectorsDest } from "../../../../../util/vector.js";
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
}