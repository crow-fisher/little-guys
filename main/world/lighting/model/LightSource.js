import { copyVecValue, getVec3Length, multiplyVectorByScalar, normalizeVec3, normalizeVec3Dest, subtractVectorsDest, vec3Dot } from "../../../util/vector.js";

export class LightSource {
    constructor(lightGroup, cs) {
        this.lightGroup = lightGroup;
        this.cs = cs;

        this.numBuckets = 40;

        this.idx = 0

        this._offset = [0, 0, 0];
        this._offsetNorm = [0, 0, 0];

        this.sectors = new Map();
    }

    updateInit(idx) {
        this.idx = idx;
        this.sectors.clear();
    }

    updateProcessBlock(block) {
        subtractVectorsDest(this.cs.world, block.centerCs.world, this._offset);
        normalizeVec3Dest(this._offset, this._offsetNorm);

        block.lightSource[this.idx] = block.lightSource[this.idx] ?? [0, [0, 0, 0], [0, 0, 0]];

        this._pitch = Math.asin(this._offsetNorm[1]);
        this._yaw = Math.atan2(this._offsetNorm[0], this._offsetNorm[2]);

        this._pSec = Math.floor(this._pitch * this.numBuckets);
        this._ySec = Math.floor(this._yaw * this.numBuckets);

        this.sectors.set(this._pSec, this.sectors.get(this._pSec) ?? new Map());
        this.sectors.get(this._pSec).set(this._ySec, this.sectors.get(this._pSec).get(this._ySec) ?? []);
        this.sectors.get(this._pSec).get(this._ySec).push(block);

        block.lightSource[this.idx][0] = getVec3Length(this._offset);
    }

    updateProcess() {
        this.sectors.values()
            .forEach((sector) => sector.values().forEach((subSec) => {
                let curLightingApplied = [1, 1, 1];
                let curIncrement = 0;
                let curSum = 1;
                let cumSum = .03;
                subSec.sort((a, b) => a.lightSource[this.idx][0] - b.lightSource[this.idx][0]);
                subSec.forEach((block) => {
                    if (block.lightSource[this.idx][0] > (curIncrement + Math.SQRT2)) {
                        curIncrement = block.lightSource[this.idx][0];
                        cumSum *= curSum;
                        curSum = 1;
                    }

                    multiplyVectorByScalar(curLightingApplied, cumSum);
                    copyVecValue(curLightingApplied, block.lightSource[this.idx][1]);
                    subtractVectorsDest(block.centerCs.world, this.cs.world, block.lightSource[this.idx][2]);
                    normalizeVec3(block.lightSource[this.idx][2]);

                    curSum *= block.getLightFilterRate();
                    
                    block.recalculateColorFlag = true;
                });
            }));
    }
}