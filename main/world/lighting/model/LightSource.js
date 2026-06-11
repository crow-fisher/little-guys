import { copyVecValue, normalizeVec3Dest, subtractVectorsDest } from "../../../util/vector.js";

export class LightSource {
    constructor(lightingManager) {
        this.lightingManager = lightingManager;
        this.cameraManager = lightingManager.worldManager.mainManager.cameraManager;

        this.numBuckets = 10;

        this.position = [0, 0, 0];
        this.idx = 0

        this._offset = [0, 0, 0];
        this._offsetNorm = [0, 0, 0];
    }

    updateInit(idx) {
        this.idx = idx;

        copyVecValue(this.cameraManager.cameraOffset, this.position);
    }

    updateProcessBlock(block) {
        subtractVectorsDest(this.position, block.centerCs.world, this._offset);
        normalizeVec3Dest(this._offset, this._offsetNorm);
        
        this._pitch = Math.asin(this._offsetNorm[1]);
        this._yaw = Math.atan2(this._offsetNorm[0], this._offsetNorm[2]);

        block.pitch = this._pitch; 
        block.yaw = this._yaw;
    }
    
    updateProcess() {

    }
}