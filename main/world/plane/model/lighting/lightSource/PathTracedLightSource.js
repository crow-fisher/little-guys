import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarDest, subtractVectorsDest } from "../../../../../util/vector.js";
import { LightSource } from "./LightSource.js";

export class PathTracedLightSource extends LightSource {
    constructor(id, config) {
        super(id, config);
        this.numRays = 10;
        this.rays = new Array(this.numRays);
        this.raysSet = new Array(this.numRays);
        this.raysSort = new Map();
    }

    calculateLighting(lightSource, box, tickBox) {
        this._rDx = (tickBox.posX - box.posX);
        this._rDy = (tickBox.posY - box.posY);
        this._rDt = Math.atan2(this._rDy, this._rDx);
        this._rDr = Math.floor(((this._rDt + Math.PI / 2) / Math.PI) * this.numRays) + this.numRays;

        this.raysSet[this._rDr] = this.raysSet[this._rDr] ?? new Set();
        this.raysSort.set(this._rDr, this.raysSort.get(this._rDr) ?? new Array());

        if (!this.raysSet[this._rDr].has(tickBox.bid)) {
            this.raysSet[this._rDr].add(tickBox.bid);
            this.raysSort.get(this._rDr).push(tickBox);

            this.raysSort.get(this._rDr).sort((a, b) =>
                getDist(a.posX, a.posY, box.posX, box.posY) -
                getDist(b.posX, b.posY, box.posX, box.posY)
            );
        }
        for (let i = 0, b; i < this.raysSort.get(this._rDr).length; i++) {
            b = this.raysSort.get(this._rDr)[i];
            multiplyVectorByScalarDest(lightSource.color, .001 * .95 ** (i), b.lightingSource.get(lightSource.id));
            subtractVectorsDest(b.lightingSource.get(lightSource.id), b.lightingSourcePrev.get(lightSource.id), b.lightingSourceDelt.get(lightSource.id));
            copyVecValue(b.lightingSource.get(lightSource.id), b.lightingSourcePrev.get(lightSource.id));
            addVectors(b.lighting, b.lightingSourceDelt.get(lightSource.id))

        }
    }

    update(plane, box) {
        super.update(plane, box);
        this.raysSort.forEach((ray) => {
            let i = 0;
            ray.sort((a, b) =>
                getDist(a.posX, a.posY, box.posX, box.posY) -
                getDist(b.posX, b.posY, box.posX, box.posY)
            );
        })
    }
}