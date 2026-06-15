import { hsvToHex } from "../../../../color/color.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { RenderJob } from "../../../../rendering/model/RenderJob.js";
import { isPointInsideQuad } from "../../../../util/quad.js";
import { addVec3Mult, addVec3MultFloor, copyVecValue, crossVec3Dest, normalizeVec3, subtractVectorsDest } from "../../../../util/vector.js";

export class Plane {
    constructor(manipulationManager, yaw, pitch, step, dimWidth, dimHeight) {
        this.manipulationManager = manipulationManager;
        this.inputManager = manipulationManager.blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = manipulationManager.blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = manipulationManager.blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = manipulationManager.blockManager.worldManager.mainManager.rasterizationManager;

        this.centerCs = new CoordinateSet(this.cameraManager);

        this.yaw = yaw;
        this.pitch = pitch;
        this.rotNorm = [0, 0, 0];

        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.step = step;
        this.dimWidth = dimWidth * step;
        this.dimHeight = dimHeight * step;

        this.processPositionUpdate();
    }

    update() {
    }

    render() {
        this.renderPoint(this.csTl(), this.rjTl());
        this.renderPoint(this.csTr(), this.rjTr());
        this.renderPoint(this.csBl(), this.rjBl());
        this.renderPoint(this.csBr(), this.rjBr());

        let x, y, centerPoint, neighborPoint, neighborPointLineRenderJob;
        let order = [[-1, 0], [1, 0], [0, 1], [0, -1]];

        for (let i = -this.dimWidth; i <= this.dimWidth; i += this.step * 2) {
            for (let j = -this.dimHeight; j <= this.dimHeight; j += this.step * 2) {
                order.forEach((arr) => {
                    x = arr[0] * this.step, y = arr[1] * this.step;

                    centerPoint = this.refPoints.get(i).get(j);
                    neighborPoint = this.refPoints.get(i + x)?.get(j + y);

                    centerPoint.process();

                    if (neighborPoint != null) {
                        neighborPoint.process();
                        if (centerPoint.isVisibleOnScreen() && neighborPoint.isVisibleOnScreen()) {
                            neighborPointLineRenderJob = this.refPointLineRenderJobs.get(i + x)?.get(j + y);
                            neighborPointLineRenderJob.v1 = centerPoint.renderScreen;
                            neighborPointLineRenderJob.v2 = neighborPoint.renderScreen;
                            this.rasterizationManager.addRenderJob(neighborPointLineRenderJob);
                        }

                    }
                });
            }
        }
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
        this.refPointLineRenderJobs = new Map();
        for (let i = -this.dimWidth; i <= this.dimWidth; i += this.step) {
            this.refPoints.set(i, new Map());
            this.refPointRenderJobs.set(i, new Map());
            this.refPointLineRenderJobs.set(i, new Map());
            for (let j = -this.dimHeight; j <= this.dimHeight; j += this.step) {
                this.refPoints.get(i).set(j, new CoordinateSet(this.cameraManager));
                this.setRefPointCoordinates(this.refPoints.get(i).get(j), i, j);
                this.refPointRenderJobs.get(i).set(j, new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 4, hsvToHex(180, 1, 1)));
                this.refPointLineRenderJobs.get(i).set(j, new LineRenderJob(this.rasterizationManager, [0, 0, 0], [0, 0, 0], 4, hsvToHex(270, 1, 1)));
            }
        }
    }

    setRefPointCoordinates(cs, i, j) {
        copyVecValue(this.centerCs.world, cs.world);
        addVec3Mult(cs.world, this.right, i + 0.5);
        addVec3MultFloor(cs.world, this.up, j + 0.5);
    }
    setMouseHoverPoint(offset) {
        if (!this.isPointOver(offset)) {
            return;
        }
        this.closestCs = null;
        this.closestDist = 100;
        let curCs, curDist;
        for (let i = -this.dimWidth; i < this.dimWidth; i += this.step) {
            for (let j = -this.dimHeight; j < this.dimHeight; j += this.step) {
                curCs = this.refPoints.get(i).get(j);
                curCs.process();
                curDist = ((offset.x - curCs.renderScreen[0]) ** 2 + (offset.y - curCs.renderScreen[1]) ** 2) ** 0.5;
                if (curDist < this.closestDist) {
                    this.closestCs = curCs;
                    this.closestDist = curDist;
                }
            }
        }
    }

    getClosestRefPoint(px, py) {
        let curCs, curDist, closestCs, closestDist = 100;
        for (let i = -this.dimWidth; i < this.dimWidth; i += this.step) {
            for (let j = -this.dimHeight; j < this.dimHeight; j += this.step) {
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
    isPointOver(offset) {
        return (
            this.csTl().isVisibleOnScreen() ||
            this.csTr().isVisibleOnScreen() ||
            this.csBl().isVisibleOnScreen() ||
            this.csBr().isVisibleOnScreen()
        ) && (isPointInsideQuad(offset,
            this.csTl().renderScreen,
            this.csTr().renderScreen,
            this.csBl().renderScreen,
            this.csBr().renderScreen
        ));
    }

    csTl() {
        return this.refPoints.get(-this.dimWidth).get(-this.dimHeight);
    }
    csTr() {
        return this.refPoints.get(this.dimWidth).get(-this.dimHeight);
    }
    csBl() {
        return this.refPoints.get(-this.dimWidth).get(this.dimHeight);
    }
    csBr() {
        return this.refPoints.get(this.dimWidth).get(this.dimHeight);
    }
    rjTl() {
        return this.refPointRenderJobs.get(-this.dimWidth).get(-this.dimHeight);
    }
    rjTr() {
        return this.refPointRenderJobs.get(this.dimWidth).get(-this.dimHeight);
    }
    rjBl() {
        return this.refPointRenderJobs.get(-this.dimWidth).get(this.dimHeight);
    }
    rjBr() {
        return this.refPointRenderJobs.get(this.dimWidth).get(this.dimHeight);
    }

    renderPoint(point, renderJob) {
        point.process();
        if (!point.isVisibleOnScreen()) {
            return;
        }
        copyVecValue(point.renderScreen, renderJob.pos);
        renderJob.size = 600 / point.distToCamera;
        this.rasterizationManager.addRenderJob(renderJob);
    }

}