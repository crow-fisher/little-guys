import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { addVec3Dest, addVectorsMult, copyVecValue, crossVec3Dest, getVec3Length, multiplyVectorByScalarDest, normalizeVec3, subtractVectorsDest } from "../../../util/vector.js";
import { LightingManager } from "../LightingManager.js";
import { LightSource } from "./LightSource.js";

export class SphereLightGroup {
    constructor(lightingManager) {
        this.lightingManager = lightingManager;
        this.canvasManager = lightingManager.worldManager.mainManager.canvasManager;
        this.cameraManager = lightingManager.worldManager.mainManager.cameraManager;
        this.rasterizationManager = lightingManager.worldManager.mainManager.rasterizationManager;
        this.centerCs = new CoordinateSet(this.cameraManager);
        this.centerRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, "#ff00ff");

        this.radius = 3;
        this.lightSources = new Array();
        this.lightRenderJobs = new Array();
        this.initLightSources();
    }

    initLightSources() {
        this.lightSources.length = 0;
        this.lightRenderJobs.length = 0;
        for (let x = -this.radius; x <= this.radius; x++) {
            for (let y = -this.radius; y <= this.radius; y++) {
                for (let z = -this.radius; z <= this.radius; z++) {
                    if (Math.round(getVec3Length([x, y, z])) != this.radius) {
                        continue;
                    }
                    this.lightSources.push(new LightSource(this, new CoordinateSet(this.cameraManager)));
                    this.lightRenderJobs.push(new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 6, "#ffe600"))
                }
            }
        }
    }

    updateInit(idx) {
        let i = 0;
        for (let x = -this.radius; x <= this.radius; x++) {
            for (let y = -this.radius; y <= this.radius; y++) {
                for (let z = -this.radius; z <= this.radius; z++) {
                    if (Math.ceil(getVec3Length([x, y, z])) >= this.radius) {
                        continue;
                    }
                    addVec3Dest(this.centerCs.world, [x, y, z], this.lightSources.at(i).cs.world);
                    this.lightSources.at(i).updateInit(idx + i);
                    this.lightSources.at(i).cs.process();
                    copyVecValue(this.lightSources.at(i).cs.renderScreen, this.lightRenderJobs.at(i).pos);
                    i += 1;
                }
            }
        }

    }

    updateRemoveBlock(block) {
        this.lightSources.forEach((ls) => ls.updateRemoveBlock(block));
    }

    updateProcessBlock(block) {
        this.lightSources.forEach((ls) => ls.updateProcessBlock(block));
    }

    updateProcess() {
        this.lightSources.forEach((ls) => ls.updateProcess());
    }
    render() {
        this.centerCs = this.centerCs ?? new CoordinateSet(this.cameraManager);
        this.centerRenderJob = this.centerRenderJob ?? new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, "#ff00ff");

        this.centerCs.process();

        if (this.centerCs.isVisibleOnScreen()) {
            copyVecValue(this.centerCs.renderScreen, this.centerRenderJob.pos);
            this.rasterizationManager.addRenderJob(this.centerRenderJob);
            this.lightRenderJobs.forEach((lrj) => this.rasterizationManager.addRenderJob(lrj));
        }
    }
}