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
        this.rightVec = [0, 0, 0];
        this.upVec = [0, 0, 0];
        this.forwardVec = [0, 0, 0];

        this.centerCs = new CoordinateSet(this.cameraManager);
        this.centerRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, "#ff00ff");

        this.dist = 1000;

        this.dimLeft = 100;
        this.dimRight = 100;
        this.dimUp = 100;
        this.dimDown = 100;

        this.upLightSource = new LightSource(this);
        this.downLightSource = new LightSource(this);
        this.leftLightSource = new LightSource(this);
        this.rightLightSource = new LightSource(this);

        this.upCs = new CoordinateSet(this.cameraManager);
        this.downCs = new CoordinateSet(this.cameraManager);
        this.leftCs = new CoordinateSet(this.cameraManager);
        this.rightCs = new CoordinateSet(this.cameraManager);

        this.upRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.downRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.leftRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
        this.rightRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600");
    }

    updateInit(idx) {
        this.upLightSource.updateInit(idx);
        this.downLightSource.updateInit(idx);
        this.leftLightSource.updateInit(idx);
        this.rightLightSource.updateInit(idx);

        this.cameraRotation = [0, 1, 0];
        this.yaw = this.cameraRotation[0];
        this.pitch = this.cameraRotation[1];

        this.rotNorm[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.rotNorm[1] = Math.sin(this.pitch);
        this.rotNorm[2] = Math.sin(this.yaw) * Math.cos(this.pitch);

        subtractVectorsDest([0, 0, 0], this.rotNorm, this.forwardVec);
        normalizeVec3(this.forwardVec);
        crossVec3Dest([0, 1, 0], this.forwardVec, this.rightVec);
        normalizeVec3(this.rightVec);
        crossVec3Dest(this.forwardVec, this.rightVec, this.upVec);
        normalizeVec3(this.upVec);

        multiplyVectorByScalarDest(this.forwardVec, this.dist, this.centerCs.world);

        copyVecValue(this.centerCs.world, this.upCs.world);
        copyVecValue(this.centerCs.world, this.downCs.world);
        copyVecValue(this.centerCs.world, this.leftCs.world);
        copyVecValue(this.centerCs.world, this.rightCs.world);

        addVectorsMult(this.leftCs.world, this.rightVec, this.dimLeft);
        addVectorsMult(this.rightCs.world, this.rightVec, -this.dimRight);
        addVectorsMult(this.upCs.world, this.upVec, this.dimUp);
        addVectorsMult(this.downCs.world, this.upVec, -this.dimDown);
        this.centerCs.process();

        copyVecValue(this.centerCs.renderScreen, this.centerRenderJob.pos);
        copyVecValue(this.upCs.world, this.upLightSource.position);
        copyVecValue(this.downCs.world, this.downLightSource.position);
        copyVecValue(this.leftCs.world, this.leftLightSource.position);
        copyVecValue(this.rightCs.world, this.rightLightSource.position);
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