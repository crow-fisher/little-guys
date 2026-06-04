import { hsvToHex } from "../../color/color.js";
import { CoordinateSet } from "../../rendering/model/CoordinateSet.js";
import { renderPointLabel } from "../../rendering/renderFunctions.js";
import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../ui/UIData.js";
import { addVec3MultDest, addVectorsMult, copyVecValue } from "../../util/vector.js";

export class Plane {
    constructor(planeManager) {
        this.planeManager = planeManager;
        this.rootCs = new CoordinateSet(this.planeManager.worldManager.getCameraManager());
        this.dirVec = [0, 0, 0];
    }

    update() {
        copyVecValue(this.planeManager.worldManager.getCameraOffset(), this.rootCs.world);
        addVectorsMult(this.rootCs.world, this.planeManager.worldManager.getForward(), -100);
        copyVecValue(this.planeManager.worldManager.getForward(), this.dirVec);
        
        this.rootCs.process();
    }
    render() {
        renderPointLabel(
            this.planeManager.worldManager.getContext(),
            ...this.rootCs.renderScreen,
            10, 
            hsvToHex(0, 1, 1)
        );
    }
}