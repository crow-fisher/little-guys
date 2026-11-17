import { getDist } from "../../../../../common.js";
import { multiplyVectorByScalarDest } from "../../../../../util/vector.js";
import { LightSource } from "./LightSource.js";

export class PathTracedLightSource extends LightSource {
    constructor(id, config) {
        super(id, config);
        this.numRays = 10;
        this.rays = new Array(this.numRays);
    }

    calculateLighting(box, tickBox, dest) {
        this._rDx = (tickBox.posX - box.posX);
        this._rDy = (tickBox.posY - box.posY);
        this._rDt = Math.atan2(this._rDy, this._rDx);
        this._rDr = ((this._rDt + Math.PI / 2) / Math.PI) * this.numRays
        tickBox.text = Math.floor(this._rDt / Math.PI * this.numRays);

        return multiplyVectorByScalarDest(this.color, this.color[3] / (30 * Math.max(16, getDist(box.posX, box.posY, tickBox.posX, tickBox.posY, 1))), dest)
    }
}