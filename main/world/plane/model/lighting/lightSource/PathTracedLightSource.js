import { getDist } from "../../../../../common.js";
import { addVectors, copyVecValue, multiplyVectorByScalarDest, subtractVectorsDest } from "../../../../../util/vector.js";
import { LightSource } from "./LightSource.js";

export class PathTracedLightSource extends LightSource {
    constructor(id, config) {
        super(id, config);
        this.numRays = 10;
        this.raysSet = new Array(this.numRays);
        this.raysSort = new Map();

        this.raysQueue = new Set();
    }

    reprocessRay(ray, box) {
        ray.sort((a, b) =>
            getDist(a.posX, a.posY, box.posX, box.posY) -
            getDist(b.posX, b.posY, box.posX, box.posY)
        );
        let m = .001;

        for (let i = 0, b; i < ray.length; i++) {
            b = ray[i];
            multiplyVectorByScalarDest(this.color, m, b.lightingSource.get(this.id));
            subtractVectorsDest(b.lightingSource.get(this.id), b.lightingSourcePrev.get(this.id), b.lightingSourceDelt.get(this.id));
            copyVecValue(b.lightingSource.get(this.id), b.lightingSourcePrev.get(this.id));
            addVectors(b.lighting, b.lightingSourceDelt.get(this.id));
            
            m *= (0.97 ** b.lfrSquare)
        }
    }

    calculateLighting(box, tickBox) {
        this._rDx = (tickBox.posX - box.posX);
        this._rDy = (tickBox.posY - box.posY);
        this._rDt = Math.atan2(this._rDy, this._rDx);
        this._rDr = Math.round(((this._rDt + Math.PI / 2) / Math.PI) * this.numRays) + this.numRays;

        this.raysSet[this._rDr] = this.raysSet[this._rDr] ?? new Set();
        this.raysSort.set(this._rDr, this.raysSort.get(this._rDr) ?? new Array());

        if (!this.raysSet[this._rDr].has(tickBox.bid)) {
            this.raysSet[this._rDr].add(tickBox.bid);
            this.raysSort.get(this._rDr).push(tickBox);
        }
        this.raysQueue.add(this._rDr);
    }

    update(plane, box) {
        super.update(plane, box);
        if (this.raysQueue.size > 0 && Math.random() > .9) {
            this.raysQueue.forEach((idx) => this.reprocessRay(this.raysSort.get(idx), box));
            this.raysQueue.clear();
        }
    }
}