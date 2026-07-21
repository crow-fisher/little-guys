import { hsvToHex, rgbToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { QuadRenderJob } from "../../../rendering/model/QuadRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderPointLabel, renderQuad } from "../../../rendering/renderFunctions.js";
import { centerVec, nnnVec, nnpVec, npnVec, nppVec, pnnVec, pnpVec, ppnVec, pppVec, pzzVec, zpzVec, zzpVec, nzzVec, znzVec, zznVec, zzzVec } from "../../../util/const.js";
import { addThreeVec3Dest, addVec3Dest, addVec3MultDest, addVectors, addVectorsMult, copyVecValue, getVec3Length, getVec3LengthSquared, multiplyVectorByScalar, multiplyVectorsDest, multiplyVectorsMultDest, normalizeVec3, subtractVectors, vec3Dot } from "../../../util/vector.js";

let bid = 0;

export class Block {
    constructor(blockManager, cartesian) {
        this._bid = bid++;
        this.blockManager = blockManager;
        this.timeManager = blockManager.worldManager.timeManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.cartesian = [Math.round(cartesian[0]), Math.round(cartesian[1]), Math.round(cartesian[2])];
        this.sector = blockManager.cartesianToSector(this.cartesian);

        /// movement
        this.grounded = true;
        // core parameters 
        this.mvOffset = [0, 0, 0];
        this.mvSpeed = [0, 0, 0];
        this.mvLast = Date.now();
        // frame computed movement parameters
        this.mvDeltaTime = [0, 0, 0];
        this.mvDeltaStep = [0, 0, 0];
        this.mvMovement = [0, 0, 0];
        this.mvEndPos = [0, 0, 0];
        this.mvFlg = false;
        /// end movement

        /// lighting and color 
        this.lightSource = [];

        this.recalculateColorFlag = true;
        this.pzzLightApplied = [1, 1, 1];
        this.zpzLightApplied = [0.5, 0.5, 0.5];
        this.zzpLightApplied = [0.25, 0.25, 0.25];
        this.nzzLightApplied = [1, 1, 1];
        this.znzLightApplied = [0.5, 0.5, 0.5];
        this.zznLightApplied = [0.25, 0.25, 0.25];

        this.colorBase = [100, 100, 100];

        this.pzzColorApplied = [100, 100, 100]
        this.zpzColorApplied = [100, 100, 100]
        this.zzpColorApplied = [100, 100, 100]
        this.nzzColorApplied = [100, 100, 100]
        this.znzColorApplied = [100, 100, 100]
        this.zznColorApplied = [100, 100, 100]

        this.pzzColorHex = "#646464";
        this.zpzColorHex = "#646464";
        this.zzpColorHex = "#646464";
        this.nzzColorHex = "#646464";
        this.znzColorHex = "#646464";
        this.zznColorHex = "#646464";
        /// end lighting and color 

        this.centerCs = new CoordinateSet(this.cameraManager, this.cartesian, centerVec);
        this.centerRenderJob = new PointLabelRenderJob(this.rasterizationManager, [0, 0, 0], 0, "#646464")

        this.nnnCs = new CoordinateSet(this.cameraManager, this.cartesian, nnnVec);
        this.nnpCs = new CoordinateSet(this.cameraManager, this.cartesian, nnpVec);
        this.npnCs = new CoordinateSet(this.cameraManager, this.cartesian, npnVec);
        this.nppCs = new CoordinateSet(this.cameraManager, this.cartesian, nppVec);
        this.pnnCs = new CoordinateSet(this.cameraManager, this.cartesian, pnnVec);
        this.pnpCs = new CoordinateSet(this.cameraManager, this.cartesian, pnpVec);
        this.ppnCs = new CoordinateSet(this.cameraManager, this.cartesian, ppnVec);
        this.pppCs = new CoordinateSet(this.cameraManager, this.cartesian, pppVec);

        this.nzzFace = [this.pnnCs, this.pnpCs, this.pppCs, this.ppnCs];
        this.pzzFace = [this.nnnCs, this.nnpCs, this.nppCs, this.npnCs];
        this.nzzRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.pzzRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.nzzNeighbor = null;
        this.pzzNeighbor = null;

        this.zpzFace = [this.npnCs, this.nppCs, this.pppCs, this.ppnCs];;
        this.znzFace = [this.nnnCs, this.nnpCs, this.pnpCs, this.pnnCs];;
        this.zpzRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.znzRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.zpzNeighbor = null;
        this.znzNeighbor = null;

        this.zzpFace = [this.nnpCs, this.nppCs, this.pppCs, this.pnpCs];;
        this.zznFace = [this.nnnCs, this.npnCs, this.ppnCs, this.pnnCs];;
        this.zzpRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.zznRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.zznNeighbor = null;
        this.zzpNeighbor = null;

        this.offsetSign = [0, 0, 0];
    }

    getLightFilterRate() {
        return 0.8;
    }

    linkNeighbors() {
        this.nzzNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [-1, 0, 0]);
        if (this.nzzNeighbor)
            this.nzzNeighbor.pzzNeighbor = this;
        this.pzzNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [1, 0, 0]);
        if (this.pzzNeighbor)
            this.pzzNeighbor.nzzNeighbor = this;
        this.znzNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, -1, 0]);
        if (this.znzNeighbor)
            this.znzNeighbor.zpzNeighbor = this;
        this.zpzNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 1, 0]);
        if (this.zpzNeighbor)
            this.zpzNeighbor.znzNeighbor = this;
        this.zznNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 0, -1]);
        if (this.zznNeighbor)
            this.zznNeighbor.zzpNeighbor = this;
        this.zzpNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 0, 1]);
        if (this.zzpNeighbor)
            this.zzpNeighbor.zznNeighbor = this;
    }

    unlinkNeighbors() {
        if (this.nzzNeighbor)
            this.nzzNeighbor.pzzNeighbor = null;
        this.nzzNeighbor = null;
        if (this.pzzNeighbor)
            this.pzzNeighbor.nzzNeighbor = null;
        this.pzzNeighbor = null;
        if (this.znzNeighbor)
            this.znzNeighbor.zpzNeighbor = null;
        this.znzNeighbor = null;
        if (this.zpzNeighbor)
            this.zpzNeighbor.znzNeighbor = null;
        this.zpzNeighbor = null;
        if (this.zznNeighbor)
            this.zznNeighbor.zzpNeighbor = null;
        this.zznNeighbor = null;
        if (this.zzpNeighbor)
            this.zzpNeighbor.zznNeighbor = null;
        this.zzpNeighbor = null;


    }

    color() {
        if (this.recalculateColorFlag) {
            // process 'lightSource' to 'lightApplied'
            // lightSource is an array of lightSource results like: 
            // [[distToCamera, [rB, gB, bB]]]
            // where 'rB', 'gB', and 'bB' are the relative brightnesses of each color (normalized at 1).

            if (this.lightSource.length > 0) {
                let dirs = [
                    [this.pzzLightApplied, this.pzzColorApplied, pzzVec],
                    [this.zpzLightApplied, this.zpzColorApplied, zpzVec],
                    [this.zzpLightApplied, this.zzpColorApplied, zzpVec],
                    [this.nzzLightApplied, this.nzzColorApplied, nzzVec],
                    [this.znzLightApplied, this.znzColorApplied, znzVec],
                    [this.zznLightApplied, this.zznColorApplied, zznVec]
                ];

                for (let i = 0; i < 6; i++) {
                    copyVecValue(zzzVec, dirs[i][0]);
                    this.lightSource.forEach((ls) => {
                        let dot = vec3Dot(dirs[i][2], ls[3]);
                        if (dot < 0) {
                            addVectorsMult(dirs[i][0], ls[1], -dot)
                        } else {
                            addVectorsMult(dirs[i][0], ls[2], dot)
                        }
                    });
                }
            }

            // calculate final color based on 'lightApplied' and 'colorBase', for each face direction 
            multiplyVectorsDest(this.colorBase, this.pzzLightApplied, this.pzzColorApplied);
            multiplyVectorsDest(this.colorBase, this.zpzLightApplied, this.zpzColorApplied);
            multiplyVectorsDest(this.colorBase, this.zzpLightApplied, this.zzpColorApplied);
            multiplyVectorsDest(this.colorBase, this.nzzLightApplied, this.nzzColorApplied);
            multiplyVectorsDest(this.colorBase, this.znzLightApplied, this.znzColorApplied);
            multiplyVectorsDest(this.colorBase, this.zznLightApplied, this.zznColorApplied);

            this.pzzColorHex = rgbToHex(...this.pzzColorApplied)
            this.zpzColorHex = rgbToHex(...this.zpzColorApplied)
            this.zzpColorHex = rgbToHex(...this.zzpColorApplied)
            this.nzzColorHex = rgbToHex(...this.nzzColorApplied)
            this.znzColorHex = rgbToHex(...this.znzColorApplied)
            this.zznColorHex = rgbToHex(...this.zznColorApplied)

            this.recalculateColorFlag = false;
        }
    }

    renderFace(face, renderJob, neighbor, color) {
        // if (getVec3LengthSquared(this.mvSpeed) == 0 && neighbor) {
        //     return;
        // }
        face[0].process();
        face[1].process();
        face[2].process();
        face[3].process();

        if (face.every((face) => !face.isVisibleOnScreen())) {
            return;
        }
        renderJob.p1 = face[0].renderScreen;
        renderJob.p2 = face[1].renderScreen;
        renderJob.p3 = face[2].renderScreen;
        renderJob.p4 = face[3].renderScreen;

        renderJob.color = color;
        this.rasterizationManager.addRenderJob(renderJob);
    }

    update() {
        this.centerCs.process();
        this.physics();

    }

    renderCenterPoint(pointRef) {
        copyVecValue(this.centerCs.renderScreen, this.centerRenderJob.pos);
        this.centerRenderJob.size = 100 / this.centerCs.distToCamera;
        this.centerRenderJob.color = hsvToHex(50, 1, 0.2);
        this.rasterizationManager.addLateRenderJob(this.centerRenderJob);
    }

    renderCenterNeighbors() {
        this.renderCenterPoint();
        let i = 0;
        this.renderLineToNeighbor(this.znzNeighbor, i++);
        this.renderLineToNeighbor(this.zpzNeighbor, i++);
        this.renderLineToNeighbor(this.zzpNeighbor, i++);
        this.renderLineToNeighbor(this.zznNeighbor, i++);
        this.renderLineToNeighbor(this.nzzNeighbor, i++);
        this.renderLineToNeighbor(this.pzzNeighbor, i++);
    }

    renderLineToNeighbor(neighbor, i) {
        this._neighborLineRenderJobs = new Array();
        if (neighbor) {
            this._neighborLineRenderJobs[i] = this._neighborLineRenderJobs[i] ?? new LineRenderJob(this.rasterizationManager, [0, 0, 0], [0, 0, 0], 5, hsvToHex(0, 1, 0));
            this._neighborLineRenderJobs[i].v1 = this.centerCs.renderScreen;
            this._neighborLineRenderJobs[i].v2 = neighbor.centerCs.renderScreen;
            this._neighborLineRenderJobs[i].color = hsvToHex(i * 60, 0.4, .6);
            this.rasterizationManager.addLateRenderJob(this._neighborLineRenderJobs[i]);
        }

    }

    renderFaces() {
        this.offsetSign[0] = (this.centerCs.offset[0] < 0) ? 0 : 1;
        this.offsetSign[1] = (this.centerCs.offset[1] < 0) ? 0 : 1;
        this.offsetSign[2] = (this.centerCs.offset[2] < 0) ? 0 : 1;

        if (this.offsetSign[0] == 0)
            this.renderFace(this.nzzFace, this.nzzRenderJob, this.pzzNeighbor, this.pzzColorHex);
        else
            this.renderFace(this.pzzFace, this.pzzRenderJob, this.nzzNeighbor, this.nzzColorHex);

        if (this.offsetSign[1] == 0)
            this.renderFace(this.zpzFace, this.zpzRenderJob, this.zpzNeighbor, this.zpzColorHex);
        else
            this.renderFace(this.znzFace, this.znzRenderJob, this.znzNeighbor, this.znzColorHex);

        if (this.offsetSign[2] == 0)
            this.renderFace(this.zzpFace, this.zzpRenderJob, this.zzpNeighbor, this.zzpColorHex);
        else
            this.renderFace(this.zznFace, this.zznRenderJob, this.zznNeighbor, this.zznColorHex);
    }

    render() {
        if (this.znzNeighbor && this.zpzNeighbor && this.zzpNeighbor && this.zznNeighbor && this.nzzNeighbor && this.pzzNeighbor) {
            return;
        }

        if (!this.centerCs.isVisibleOnScreen()) {
            return;
        }

        this.color();
        // this.renderCenterNeighbors();
        this.renderFaces();

    }

    physics() {
        if (this.timeManager.dDay == 0) {
            return;
        };

        if (!this.grounded) {
            this.gravityPhysics();
            this.neighborPhysics();
            this.calculateAndSubmitMvDeltaTimes();
        }
    }

    gravityPhysics() {
        // this.mvSpeed[1] += (10 ** -2) * 9.8 / this.timeManager.dt;

        this.mvSpeed[1] += .05;
        // this.mvSpeed[0] -= .0001;
        // this.mvSpeed[2] -= .0001;
    }

    neighborPhysics() {

        // this._neighborPhysics(this.znzNeighbor, 1, Math.max);
        this._neighborPhysics(this.zpzNeighbor, 1, Math.min);

        // this._neighborPhysics(this.pzzNeighbor, 0, Math.min);
        // this._neighborPhysics(this.nzzNeighbor, 0, Math.max);

        // this._neighborPhysics(this.zpzNeighbor, 1, Math.min);
        // this._neighborPhysics(this.znzNeighbor, 1, Math.max);

        // this._neighborPhysics(this.zzpNeighbor, 2, Math.min);
        // this._neighborPhysics(this.zznNeighbor, 2, Math.max);
    }

    _neighborPhysics(neighbor, idx, func) {
        if (neighbor) {
            // this.mvSpeed[idx] = func(this.mvSpeed[idx], neighbor.mvSpeed[idx])
            // this.mvOffset[idx] = func(this.mvOffset[idx], neighbor.mvOffset[idx])
            let gap = this.mvOffset[idx] - neighbor.mvOffset[idx];
            if (gap > 0) {
                this.mvOffset[idx] -= gap;
            }
            if (gap > -0.01) {
                this.mvSpeed[idx] = 0;
            }
        }

    }

    calculateAndSubmitMvDeltaTimes() {
        this.calculateMvDeltaTime(0);
        this.calculateMvDeltaTime(1);
        this.calculateMvDeltaTime(2);
        this.blockManager.registerBlockMvTimes(this);
    }

    applyMovementAtTime(t) {
        addVectorsMult(this.mvOffset, this.mvSpeed, .01 * (t - this.mvLast)); // time in millis.
        // console.log(this.mvOffset, this.mvSpeed, .001 * (t - this.mvLast));
        this.mvLast = t;
        this.applyMovement();

    }
    applyMovement() {
        copyVecValue([0, 0, 0], this.mvMovement);
        this.calculateCartesianMovement(0);
        this.calculateCartesianMovement(1);
        this.calculateCartesianMovement(2);

        if (getVec3LengthSquared(this.mvOffset) > 2) {
            copyVecValue([0, 0, 0], this.mvOffset);
        }

        if (getVec3LengthSquared(this.mvMovement) > 0) {
            addVec3Dest(this.cartesian, this.mvMovement, this.mvEndPos);
            if (this.blockManager.updateBlockPosition(this, this.mvEndPos)) {
                // we moved the block
                this.transformOffsetMovement(0)
                this.transformOffsetMovement(1)
                this.transformOffsetMovement(2)
                // subtractVectors(this.mvOffset, this.mvMovement);
            } else {
                // we didn't
            }
        }

        addThreeVec3Dest(this.cartesian, centerVec, this.mvOffset, this.centerCs.world);
        addThreeVec3Dest(this.cartesian, nnnVec, this.mvOffset, this.nnnCs.world);
        addThreeVec3Dest(this.cartesian, nnpVec, this.mvOffset, this.nnpCs.world);
        addThreeVec3Dest(this.cartesian, npnVec, this.mvOffset, this.npnCs.world);
        addThreeVec3Dest(this.cartesian, nppVec, this.mvOffset, this.nppCs.world);
        addThreeVec3Dest(this.cartesian, pnnVec, this.mvOffset, this.pnnCs.world);
        addThreeVec3Dest(this.cartesian, pnpVec, this.mvOffset, this.pnpCs.world);
        addThreeVec3Dest(this.cartesian, ppnVec, this.mvOffset, this.ppnCs.world);
        addThreeVec3Dest(this.cartesian, pppVec, this.mvOffset, this.pppCs.world);

    }

    calculateCartesianMovement(i) {
        if (this.mvOffset[i] < -1) {
            this.mvMovement[i] -= 1;
        } else if (this.mvOffset[i] > 1) {
            this.mvMovement[i] += 1;
        }
        // this.mvOffset[i] = Math.min(Math.max(0, this.mvOffset[i]), 1);
    }

    transformOffsetMovement(i) {
        if (this.mvMovement[i] == -1) {
            this.mvOffset[i] += 1;
        } else if (this.mvMovement[i] == 1) {
            this.mvOffset[i] -= 1;
        }
    }

    calculateMvDeltaTime(i) {
        if (this.mvSpeed[i] == 0) {
            this.mvDeltaTime[i] = -1;
            this.mvDeltaStep[i] = -1;
        } else if (this.mvSpeed[i] > 0) {
            this.mvDeltaTime[i] = (1 - this.mvOffset[i]) / this.mvSpeed[i];
        } else {
            this.mvDeltaTime[i] = this.mvOffset[i] / this.mvSpeed[i];
        }
        this.mvDeltaTime[i] = Math.abs(this.mvDeltaTime[i]);
        this.mvDeltaStep[i] = 1 / this.mvSpeed[1];
    }
}