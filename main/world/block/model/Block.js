import { hsvToHex, rgbToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { QuadRenderJob } from "../../../rendering/model/QuadRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderPointLabel, renderQuad } from "../../../rendering/renderFunctions.js";
import { centerVec, nnnVec, nnpVec, npnVec, nppVec, pnnVec, pnpVec, ppnVec, pppVec } from "../../../util/const.js";
import { addThreeVec3Dest, addVec3Dest, addVec3MultDest, addVectors, addVectorsMult, copyVecValue, getVec3Length, getVec3LengthSquared, multiplyVectorByScalar, multiplyVectorsDest, multiplyVectorsMultDest, normalizeVec3, subtractVectors } from "../../../util/vector.js";

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
        this.lightApplied100 = [1, 1, 1];
        this.lightApplied010 = [0.5, 0.5, 0.5];
        this.lightApplied001 = [0.25, 0.25, 0.25];

        this.colorBase = [100, 100, 100];
        this.colorApplied100 = [100, 100, 100]
        this.colorApplied010 = [100, 100, 100]
        this.colorApplied001 = [100, 100, 100]

        this.colorHex100 = "#646464";
        this.colorHex010 = "#646464";
        this.colorHex001 = "#646464";
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

        this.frontFace = [this.pnnCs, this.pnpCs, this.pppCs, this.ppnCs];
        this.backFace = [this.nnnCs, this.nnpCs, this.nppCs, this.npnCs];
        this.frontRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.backRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.frontNeighbor = null;
        this.backNeighbor = null;

        this.bottomFace = [this.npnCs, this.nppCs, this.pppCs, this.ppnCs];;
        this.topFace = [this.nnnCs, this.nnpCs, this.pnpCs, this.pnnCs];;
        this.bottomRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.topRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.bottomNeighbor = null;
        this.topNeighbor = null;

        this.rightFace = [this.nnpCs, this.nppCs, this.pppCs, this.pnpCs];;
        this.leftFace = [this.nnnCs, this.npnCs, this.ppnCs, this.pnnCs];;
        this.rightRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.leftRenderJob = new QuadRenderJob(this.rasterizationManager);
        this.rightNeighbor = null;
        this.leftNeighbor = null;

        this.offsetSign = [0, 0, 0];
    }

    getLightFilterRate() {
        return 0.999999999;
    }

    linkNeighbors() {
        this.frontNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [-1, 0, 0]);
        if (this.frontNeighbor)
            this.frontNeighbor.backNeighbor = this;
        this.backNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [1, 0, 0]);
        if (this.backNeighbor)
            this.backNeighbor.frontNeighbor = this;
        this.bottomNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 1, 0]);
        if (this.bottomNeighbor)
            this.bottomNeighbor.topNeighbor = this;
        this.topNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, -1, 0]);
        if (this.topNeighbor)
            this.topNeighbor.bottomNeighbor = this;
        this.rightNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 0, -1]);
        if (this.rightNeighbor)
            this.rightNeighbor.leftNeighbor = this;
        this.leftNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 0, 1]);
        if (this.leftNeighbor)
            this.leftNeighbor.rightNeighbor = this;
    }

    unlinkNeighbors() {
        if (this.frontNeighbor)
            this.frontNeighbor.backNeighbor = null;
        this.frontNeighbor = null;
        if (this.backNeighbor)
            this.backNeighbor.frontNeighbor = null;
        this.backNeighbor = null;
        if (this.bottomNeighbor)
            this.bottomNeighbor.topNeighbor = null;
        this.bottomNeighbor = null;
        if (this.topNeighbor)
            this.topNeighbor.bottomNeighbor = null;
        this.topNeighbor = null;
        if (this.rightNeighbor)
            this.rightNeighbor.leftNeighbor = null;
        this.rightNeighbor = null;
        if (this.leftNeighbor)
            this.leftNeighbor.rightNeighbor = null;
        this.leftNeighbor = null;

    }

    color() {
        if (this.recalculateColorFlag) {
            // process 'lightSource' to 'lightApplied'
            // lightSource is an array of lightSource results like: 
            // [[distToCamera, [rB, gB, bB]]]
            // where 'rB', 'gB', and 'bB' are the relative brightnesses of each color (normalized at 1).

            if (this.lightSource.length > 0) {
                let dirs = [[this.lightApplied100, this.colorApplied100],
                [this.lightApplied010, this.colorApplied010],
                [this.lightApplied001, this.colorApplied001]];
                for (let i = 0; i < 3; i++) {
                    dirs[i][0][0] = 0;
                    dirs[i][0][1] = 0;
                    dirs[i][0][2] = 0;
                    this.lightSource.forEach((ls) => addVectorsMult(dirs[i][0], ls[1], Math.abs(ls[2][i])));
                }
            }


            // calculate final color based on 'lightApplied' and 'colorBase', for each face direction 
            multiplyVectorsDest(this.colorBase, this.lightApplied100, this.colorApplied100);
            multiplyVectorsDest(this.colorBase, this.lightApplied010, this.colorApplied010);
            multiplyVectorsDest(this.colorBase, this.lightApplied001, this.colorApplied001);

            this.colorHex100 = rgbToHex(...this.colorApplied100)
            this.colorHex010 = rgbToHex(...this.colorApplied010)
            this.colorHex001 = rgbToHex(...this.colorApplied001)
            this.recalculateColorFlag = false;
        }
    }

    renderFace(face, renderJob, neighbor, color) {
        if (neighbor) {
            return;
        }
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
        this.renderLineToNeighbor(this.topNeighbor, i++);
        this.renderLineToNeighbor(this.bottomNeighbor, i++);
        this.renderLineToNeighbor(this.leftNeighbor, i++);
        this.renderLineToNeighbor(this.rightNeighbor, i++);
        this.renderLineToNeighbor(this.frontNeighbor, i++);
        this.renderLineToNeighbor(this.backNeighbor, i++);
    }

    renderLineToNeighbor(neighbor, i) {
        this._neighborLineRenderJobs = new Array();
        if (neighbor) {
            this._neighborLineRenderJobs[i] = this._neighborLineRenderJobs[i] ?? new LineRenderJob(this.rasterizationManager, [0, 0, 0], [0, 0, 0], 5, hsvToHex(0, 1, 0));
            this._neighborLineRenderJobs[i].v1 = this.centerCs.renderScreen;
            this._neighborLineRenderJobs[i].v2 = neighbor.centerCs.renderScreen;
            this._neighborLineRenderJobs[i].color = hsvToHex(i * 60, 0.2, 0.6);
            this.rasterizationManager.addLateRenderJob(this._neighborLineRenderJobs[i]);
        }

    }

    renderFaces() {
        this.offsetSign[0] = (this.centerCs.offset[0] < 0) ? 0 : 1;
        this.offsetSign[1] = (this.centerCs.offset[1] < 0) ? 0 : 1;
        this.offsetSign[2] = (this.centerCs.offset[2] < 0) ? 0 : 1;

        if (this.offsetSign[0] == 0)
            this.renderFace(this.frontFace, this.frontRenderJob, this.backNeighbor, this.colorHex100);
        else
            this.renderFace(this.backFace, this.backRenderJob, this.frontNeighbor, this.colorHex100);

        if (this.offsetSign[1] == 0)
            this.renderFace(this.bottomFace, this.bottomRenderJob, this.bottomNeighbor, this.colorHex010);
        else
            this.renderFace(this.topFace, this.topRenderJob, this.topNeighbor, this.colorHex010);

        if (this.offsetSign[2] == 0)
            this.renderFace(this.rightFace, this.rightRenderJob, this.leftNeighbor, this.colorHex001);
        else
            this.renderFace(this.leftFace, this.leftRenderJob, this.rightNeighbor, this.colorHex001);
    }

    render() {
        if (this.topNeighbor && this.bottomNeighbor && this.leftNeighbor && this.rightNeighbor && this.frontNeighbor && this.backNeighbor) {
            return;
        }

        if (!this.centerCs.isVisibleOnScreen()) {
            return;
        }

        this.color();
        this.renderCenterNeighbors();
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
        this.mvSpeed[0] += .00;
        this.mvSpeed[2] += .0001;
    }

    neighborPhysics() {

        this._neighborPhysics1(this.bottomNeighbor, 1, 0);


        // this._neighborPhysics1(this.rightNeighbor, 0, 0);
        // this._neighborPhysics1(this.leftNeighbor, 0, 1);
        // this._neighborPhysics1(this.topNeighbor, 1, 1);
        // this._neighborPhysics1(this.frontNeighbor, 2, 0);
        // this._neighborPhysics1(this.backNeighbor, 2, 1);
    }

    _neighborPhysics1(neighbor, idx, value) {
        if (neighbor) {
            this.mvSpeed[idx] = 0;
            this.mvOffset[idx] = 0;
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
        if (this.mvOffset[i] < 0) {
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