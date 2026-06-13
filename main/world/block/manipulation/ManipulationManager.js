import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { copyMatValue } from "../../../util/matrix.js";
import { addVec3Mult, addVec3MultDest, addVec3MultFloor, addVectorsMult, copyVecValue, vec3Dot } from "../../../util/vector.js";

export class ManipulationManager {
    constructor(blockManager) {
        this.blockManager = blockManager;
        this.inputManager = blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        
        this.planes = new Array();
    }

    update() {

    }

    render() {
        this.renderCross();
        this.renderCorners();
        this.renderHoverPoint();
    }
}