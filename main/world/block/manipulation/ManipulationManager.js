import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { copyMatValue } from "../../../util/matrix.js";
import { addVec3Mult, addVec3MultDest, addVec3MultFloor, addVectorsMult, copyVecValue, vec3Dot } from "../../../util/vector.js";
import { Plane } from "./model/Plane.js";

export class ManipulationManager {
    constructor(blockManager) {
        this.blockManager = blockManager;
        this.inputManager = blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.planeManagerComponent = blockManager.worldManager.mainManager.uiManager.planeManagerComponent;

        this.planes = new Array();

        this.zPlane = new Plane(this, 0, Math.PI / 2, 10, 20, 20);
        this.newPlane = new Plane(this, 0, Math.PI / 2, 5, 20, 20);
    }

    update() {
        if (this.planeManagerComponent.gcvZMode() == 0) {
            this.zPlane.centerCs.world[0] = this.cameraManager.cameraOffset[0];
            this.zPlane.centerCs.world[2] = this.cameraManager.cameraOffset[2];
            this.zPlane.centerCs.world[1] = this.cameraManager.cameraOffset[1] + 4;
        }


        this.zPlane.processPositionUpdate();

        if (this.planeManagerComponent.gcvModMode() == 1) {
            copyVecValue(this.cameraManager.cameraOffset, this.newPlane.centerCs.world);
            addVec3Mult(this.newPlane.centerCs.world, this.cameraManager.forward, -this.planeManagerComponent.gcvModDist());
            this.newPlane.processPositionUpdate();
        }

        if (this.planeManagerComponent.dirtyConfig) {
            this.newPlane.step = Math.round(this.planeManagerComponent.gcvPlaneStep());
            this.newPlane.dimWidth = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
            this.newPlane.dimHeight = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
            this.newPlane.yaw = this.planeManagerComponent.gcvPlaneYaw();
            this.newPlane.pitch = this.planeManagerComponent.gcvPlanePitch();
            this.newPlane.processPositionUpdate();
        }

    }

    render() {
        this.zPlane.render();

        this.planes.forEach((plane) => plane.render())
        
        if (this.planeManagerComponent.gcvModMode() == 1) {
            this.newPlane.render();

            if (this.planeManagerComponent.gcvPlaneSubmit()) {
                this.planes.push(this.newPlane);
                this.newPlane = new Plane(this, 0, Math.PI / 2, 5, 5, 5);
                this.planeManagerComponent.scvPlaneSubmit(false)

                this.newPlane.step = Math.round(this.planeManagerComponent.gcvPlaneStep());
                this.newPlane.dimWidth = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
                this.newPlane.dimHeight = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
                this.newPlane.yaw = this.planeManagerComponent.gcvPlaneYaw();
                this.newPlane.pitch = this.planeManagerComponent.gcvPlanePitch();
                this.newPlane.processPositionUpdate();
            }

        }
    }
}