import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { addVectorsMult, copyVecValue, crossVec3Dest, multiplyVectorByScalarDest, normalizeVec3, subtractVectorsDest } from "../../../util/vector.js";
import { LightingManager } from "../LightingManager.js";
import { LightSource } from "./LightSource.js";

export class LightGroup {
    constructor(lightingManager) {
        this.lightingManager = lightingManager;
        this.canvasManager = lightingManager.worldManager.mainManager.canvasManager;
        this.cameraManager = lightingManager.worldManager.mainManager.cameraManager;
        this.rasterizationManager = lightingManager.worldManager.mainManager.rasterizationManager;

        this.rotNorm = [0, 0, 0];
        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.centerCs = new CoordinateSet(this.cameraManager);
        this.centerRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, "#ff00ff");

        this.dist = 1000;

        this.dimLeft = 1;
        this.dimRight = 1;
        this.dimUp = 1;
        this.dimDown = 1;

        this.upCs = new CoordinateSet(this.cameraManager);
        this.downCs = new CoordinateSet(this.cameraManager);
        this.leftCs = new CoordinateSet(this.cameraManager);
        this.rightCs = new CoordinateSet(this.cameraManager);

        this.upLightSource = new LightSource(this, this.upCs);
        this.downLightSource = new LightSource(this, this.downCs);
        this.leftLightSource = new LightSource(this, this.leftCs);
        this.rightLightSource = new LightSource(this, this.rightCs);

        this.upRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.downRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.leftRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.rightRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");

        this.initPosition();
    }


    initPosition() {
        this.cameraRotation = [0, 1, 0];
        this.yaw = this.cameraRotation[0];
        this.pitch = this.cameraRotation[1];

        this.rotNorm[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.rotNorm[1] = Math.sin(this.pitch);
        this.rotNorm[2] = Math.sin(this.yaw) * Math.cos(this.pitch);

        subtractVectorsDest([0, 0, 0], this.rotNorm, this.forward);
        normalizeVec3(this.forward);
        crossVec3Dest([0, 1, 0], this.forward, this.right);
        normalizeVec3(this.right);
        crossVec3Dest(this.forward, this.right, this.up);
        normalizeVec3(this.up);

        multiplyVectorByScalarDest(this.forward, this.dist, this.centerCs.world);

    }
    updateInit(idx) {
        this.upLightSource.updateInit(idx);
        this.downLightSource.updateInit(idx);
        this.leftLightSource.updateInit(idx);
        this.rightLightSource.updateInit(idx);

        copyVecValue(this.centerCs.world, this.upCs.world);
        copyVecValue(this.centerCs.world, this.downCs.world);
        copyVecValue(this.centerCs.world, this.leftCs.world);
        copyVecValue(this.centerCs.world, this.rightCs.world);

        addVectorsMult(this.leftCs.world, this.right, this.dimLeft);
        addVectorsMult(this.rightCs.world, this.right, -this.dimRight);
        addVectorsMult(this.upCs.world, this.up, this.dimUp);
        addVectorsMult(this.downCs.world, this.up, -this.dimDown);
        this.centerCs.process();

        copyVecValue(this.centerCs.renderScreen, this.centerRenderJob.pos);
    }

    updateProcessBlock(block) {
        this.upLightSource.updateProcessBlock(block);
        this.downLightSource.updateProcessBlock(block);
        this.leftLightSource.updateProcessBlock(block);
        this.rightLightSource.updateProcessBlock(block);
    }

    updateProcess() {
        this.upLightSource.updateProcess();
        this.downLightSource.updateProcess();
        this.leftLightSource.updateProcess();
        this.rightLightSource.updateProcess();
    }

    render() {
        if (this.centerCs.isVisibleOnScreen()) {
            this.rasterizationManager.addRenderJob(this.centerRenderJob);

            this.upCs.process();
            this.downCs.process();
            this.leftCs.process();
            this.rightCs.process();

            copyVecValue(this.upCs.renderScreen, this.upRenderJob.pos);
            copyVecValue(this.downCs.renderScreen, this.downRenderJob.pos);
            copyVecValue(this.leftCs.renderScreen, this.leftRenderJob.pos);
            copyVecValue(this.rightCs.renderScreen, this.rightRenderJob.pos);

            this.rasterizationManager.addRenderJob(this.upRenderJob);
            this.rasterizationManager.addRenderJob(this.downRenderJob);
            this.rasterizationManager.addRenderJob(this.leftRenderJob);
            this.rasterizationManager.addRenderJob(this.rightRenderJob);
        }
    }
}