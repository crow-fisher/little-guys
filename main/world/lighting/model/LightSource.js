import { removeItemAll } from "../../../common.js";
import { removeItemOnce } from "../../../util/func.js";
import { copyVecValue, getVec3Length, multiplyVectorByScalar, multiplyVectorByScalarDest, normalizeVec3, normalizeVec3Dest, subtractVectorsDest, subtractVectorsDestNorm, vec3Dot } from "../../../util/vector.js";

export class LightSource {
    constructor(lightGroup, cs) {
        this.lightGroup = lightGroup;
        this.cs = cs;
        this.brightness = 10 ** -4;
        this.color = [255, 255, 255];

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

    updateRemoveBlock(block) {
        subtractVectorsDest(this.cs.world, block.centerCs.world, this._offset);
        normalizeVec3Dest(this._offset, this._offsetNorm);
        this._pitch = Math.asin(this._offsetNorm[1]);
        this._yaw = Math.atan2(this._offsetNorm[0], this._offsetNorm[2]);
        this._pSec = Math.floor(this._pitch * this.numBuckets);
        this._ySec = Math.floor(this._yaw * this.numBuckets);
        removeItemOnce(this.sectors.get(this._pSec)?.get(this._ySec), block);
    }

    updateProcessBlock(block) {
        subtractVectorsDest(this.cs.world, block.centerCs.world, this._offset);
        normalizeVec3Dest(this._offset, this._offsetNorm);

        block.lightSource[this.idx] = block.lightSource[this.idx] ?? [0, [0, 0, 0], [0, 0, 0], [0, 0, 0]];

        this._pitch = Math.asin(this._offsetNorm[1]);
        this._yaw = Math.atan2(this._offsetNorm[0], this._offsetNorm[2]);

        this._pSec = Math.floor(this._pitch * this.numBuckets);
        this._ySec = Math.floor(this._yaw * this.numBuckets);

        this.sectors.set(this._pSec, this.sectors.get(this._pSec) ?? new Map());
        this.sectors.get(this._pSec).set(this._ySec, this.sectors.get(this._pSec).get(this._ySec) ?? []);
        this.sectors.get(this._pSec).get(this._ySec).push(block);

        block.lightSource[this.idx][0] = getVec3Length(this._offset); // lighting position 0 is the block's distance to the light source
    }

    updateProcess() {
        this.sectors.values()
            .forEach((sector) => sector.values().forEach((subSec) => {
                let lightColor = structuredClone(this.color);
                let lightBrightness = this.brightness;
                
                let curLightingApplied = new Array(3);
                
                subSec.sort((a, b) => a.lightSource[this.idx][0] - b.lightSource[this.idx][0]);
                subSec.forEach((block) => {
                    multiplyVectorByScalarDest(lightColor, lightBrightness, curLightingApplied);
                    copyVecValue(curLightingApplied, block.lightSource[this.idx][1]); // position 1 is the brightness of the light entering the block
                    lightBrightness *= block.getLightFilterRate();
                    multiplyVectorByScalarDest(curLightingApplied, lightBrightness * 0.5, block.lightSource[this.idx][2]); // position 2 is the brightness of the light leaving the block

                    subtractVectorsDestNorm(block.centerCs.world, this.cs.world, block.lightSource[this.idx][3]); // position 3 is a normalized vector pointing from this light source to the block 
                    block.recalculateColorFlag = true;
                });
            }));
    }
}