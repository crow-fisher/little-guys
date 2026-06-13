import { hsvToHex } from "../../../../color/color.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { RenderJob } from "../../../../rendering/model/RenderJob.js";
import { copyVecValue } from "../../../../util/vector.js";

export class Plane {
    constructor(manipulationManager, dimWidth=1, dimHeight=1) {
        this.manipulationManager = manipulationManager;
        this.inputManager = manipulationManager.blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = manipulationManager.blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = manipulationManager.blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = manipulationManager.blockManager.worldManager.mainManager.rasterizationManager;

        this.centerCs = new CoordinateSet(this.cameraManager);

        this.yaw = 0;
        this.pitch = 0;
        this.rotNorm = [0, 0, 0];

        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.dimWidth = dimWidth;
        this.dimHeight = dimHeight;
    }

    processPositionUpdate() {
        this.rotNorm[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.rotNorm[1] = Math.sin(this.pitch);
        this.rotNorm[2] = Math.sin(this.yaw) * Math.cos(this.pitch);
        subtractVectorsDest([0, 0, 0], this.rotNorm, this.forward);
        normalizeVec3(this.forward);
        crossVec3Dest([0, 1, 0], this.forward, this.right);
        normalizeVec3(this.right);
        crossVec3Dest(this.forward, this.right, this.up);
        normalizeVec3(this.up);
        this.initRefPoints();
    }

    initRefPoints() {
        this.refPoints = new Map();
        this.refPointRenderJobs = new Map();
        for (let i = -this.dimWidth; i < this.dimWidth; i += Math.max(1, Math.ceil(this.dimWidth / 10))) {
            this.refPoints.set(i, new Map());
            for (let j = -this.dimHeight; j < this.dimHeight; j += Math.max(1, Math.ceil(this.dimHeight / 10))) {
                this.refPoints.get(i).set(j, new CoordinateSet(this.cameraManager));
                this.setRefPointCoordinates(this.refPoints.get(i).get(j), i, j);

                this.refPointRenderJobs.get(i).set(j, new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, hsvToHex(180, 1, 1)));
            }
        }
    }

    setRefPointCoordinates(cs, i, j) {
        copyVecValue(this.centerCs.world, cs.world);
        addVec3Mult(cs.world, this.right, i + 0.5);
        addVec3MultFloor(cs.world, this.up, j + 0.5);
    }

    getClosestRefPoint(px, py) {
        let curCs, curDist, closestCs, closestDist = 100;
        for (let i = -this.dimWidth; i < this.dimWidth; i += STEP) {
            for (let j = -this.dimHeight; j < this.dimHeight; j += STEP) {
                curCs = this.refPoints.get(i).get(j);
                curCs.process();
                curDist = ((px - curCs.renderScreen[0]) ** 2 + (py - curCs.renderScreen[1]) ** 2) ** 0.5;
                if (curDist < closestDist) {
                    closestCs = curCs;
                    closestDist = curDist;
                }
            }
        }
        return closestCs;
    }


    csTl() {
        return this.refPoints.get(-this.dimWidth).get(-this.dimWidth);
    }
    csTr() {
        return this.refPoints.get(this.dimWidth).get(-this.dimWidth);
    }
    csBl() {
        return this.refPoints.get(-this.dimWidth).get(this.dimWidth);
    }
    csBr() {
        return this.refPoints.get(this.dimWidth).get(this.dimWidth);
    }
    rjTl() {
        return this.refPointRenderJobs.get(-this.dimWidth).get(-this.dimWidth);
    }
    rjTr() {
        return this.refPointRenderJobs.get(this.dimWidth).get(-this.dimWidth);
    }
    rjBl() {
        return this.refPointRenderJobs.get(-this.dimWidth).get(this.dimWidth);
    }
    rjBr() {
        return this.refPointRenderJobs.get(this.dimWidth).get(this.dimWidth);
    }

    renderPoint(point, renderJob) {
        point.process();
        if (!point.isVisibleOnScreen()) {
            return;
        }
        copyVecValue(point.renderScreen, renderJob.pos);
        renderJob.size = 10;
        this.rasterizationManager.addRenderJob(renderJob);
    }

    update() {
    }

    render() {
        this.renderPoint(this.csTl(), this.rjTl());
        this.renderPoint(this.csTr(), this.rjTr());
        this.renderPoint(this.csBl(), this.rjBl());
        this.renderPoint(this.csBr(), this.rjBr());
    }

    
}