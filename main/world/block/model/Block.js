import { hsvToHex, rgbToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { QuadRenderJob } from "../../../rendering/model/QuadRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderPointLabel, renderQuad } from "../../../rendering/renderFunctions.js";
import { centerVec, nnnVec, nnpVec, npnVec, nppVec, pnnVec, pnpVec, ppnVec, pppVec } from "../../../util/const.js";
import { addVectors, addVectorsMult, copyVecValue, multiplyVectorsDest, multiplyVectorsMultDest } from "../../../util/vector.js";


export class Block {
    constructor(blockManager, cartesian) {
        this.blockManager = blockManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.cartesian = [0, 0, 0];
        this.cartesian[0] = Math.round(cartesian[0]);
        this.cartesian[1] = Math.round(cartesian[1]);
        this.cartesian[2] = Math.round(cartesian[2]);

        this.sector = blockManager.cartesianToSector(this.cartesian);

        this.lightSource = [];
        this.lightApplied100 = [1, 1, 1];
        this.lightApplied010 = [1, 1, 1];
        this.lightApplied001 = [1, 1, 1];

        this.colorBase = [100, 100, 100];
        this.colorApplied100 = [100, 100, 100]
        this.colorApplied010 = [100, 100, 100]
        this.colorApplied001 = [100, 100, 100]

        this.colorHex100 = "#646464";
        this.colorHex010 = "#646464";
        this.colorHex001 = "#646464";

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
        this.linkNeighbors();
    }

    getLightFilterRate() {
        let ret = 0.98;
        let exp = 1.2;

        if (this.frontNeighbor) {
            ret = ret ** exp;
        }
        if (this.backNeighbor) {
            ret = ret ** exp;
        }
        if (this.bottomNeighbor) {
            ret = ret ** exp;
        }
        if (this.topNeighbor) {
            ret = ret ** exp;
        }
        if (this.rightNeighbor) {
            ret = ret ** exp;
        }
        if (this.leftNeighbor) {
            ret = ret ** exp;
        }
        return ret;
    }

    linkNeighbors() {
        this.frontNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [-1, 0, 0]);
        if (this.frontNeighbor)
            this.frontNeighbor.backNeighbor = this;
        this.backNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [1, 0, 0]);
        if (this.backNeighbor)
            this.backNeighbor.frontNeighbor = this;
        this.bottomNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, -1, 0]);
        if (this.bottomNeighbor)
            this.bottomNeighbor.topNeighbor = this;
        this.topNeighbor = this.blockManager.getBlockAtCartesian(this.cartesian, [0, 1, 0]);
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
            this.backNeighbor.frontNeighbor = this;
        this.backNeighbor = null;
        if (this.bottomNeighbor)
            this.bottomNeighbor.topNeighbor = this;
        this.bottomNeighbor = null;
        if (this.topNeighbor)
            this.topNeighbor.bottomNeighbor = this;
        this.topNeighbor = null;
        if (this.rightNeighbor)
            this.rightNeighbor.leftNeighbor = this;
        this.rightNeighbor = null;
        if (this.leftNeighbor)
            this.leftNeighbor.rightNeighbor = this;
        this.leftNeighbor = null;

    }

    color() {
        // process 'lightSource' to 'lightApplied'
        // lightSource is an array of lightSource results like: 
        // [[distToCamera, [rB, gB, bB]]]
        // where 'rB', 'gB', and 'bB' are the relative brightnesses of each color (normalized at 1).
        let dirs = [[this.lightApplied100, this.colorApplied100],
        [this.lightApplied010, this.colorApplied010],
        [this.lightApplied001, this.colorApplied001]];
        for (let i = 0; i < 3; i++) {
            dirs[i][0][0] = 0;
            dirs[i][0][1] = 0;
            dirs[i][0][2] = 0;
            this.lightSource.forEach((ls) => addVectorsMult(dirs[i][0], ls[1], ls[2][i]));
        }
        // calculate final color based on 'lightApplied' and 'colorBase', for each face direction 
        multiplyVectorsDest(this.colorBase, this.lightApplied100, this.colorApplied100);
        multiplyVectorsDest(this.colorBase, this.lightApplied010, this.colorApplied010);
        multiplyVectorsDest(this.colorBase, this.lightApplied001, this.colorApplied001);

        this.colorHex100 = rgbToHex(...this.colorApplied100)
        this.colorHex010 = rgbToHex(...this.colorApplied010)
        this.colorHex001 = rgbToHex(...this.colorApplied001)
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
        if (this.topNeighbor && this.bottomNeighbor && this.leftNeighbor && this.rightNeighbor && this.frontNeighbor && this.backNeighbor) {
            return;
        }

        this.centerCs.process();
    }

    renderPoint(pointRef) {
        this.offsetDiff = 0;
        this.offsetDiff += Math.abs(this.offsetSign[0] - pointRef.worldOffset[0]);
        this.offsetDiff += Math.abs(this.offsetSign[1] - pointRef.worldOffset[1]);
        this.offsetDiff += Math.abs(this.offsetSign[2] - pointRef.worldOffset[2]);
        if (this.offsetDiff > 0) {
            renderPointLabel(
                this.canvasManager.context,
                ...pointRef.renderScreen,
                100 / pointRef.distToCamera,
                hsvToHex(pointRef.distToCamera, 1, .8)
            )
        }

    }

    render() {
        if (this.topNeighbor && this.bottomNeighbor && this.leftNeighbor && this.rightNeighbor && this.frontNeighbor && this.backNeighbor) {
            return;
        }

        if (!this.centerCs.isVisibleOnScreen()) {
            return;
        }

        this.color();

        if (this.centerCs.distToCamera > 150) {
            copyVecValue(this.centerCs.renderScreen, this.centerRenderJob.pos);
            this.centerRenderJob.size = 1200 / this.centerCs.distToCamera;
            this.centerRenderJob.color = this.colorHex100;
            this.rasterizationManager.addRenderJob(this.centerRenderJob);
            return;
        }

        this.offsetSign[0] = (this.centerCs.offset[0] < 0) ? 0 : 1;
        this.offsetSign[1] = (this.centerCs.offset[1] < 0) ? 0 : 1;
        this.offsetSign[2] = (this.centerCs.offset[2] < 0) ? 0 : 1;

        if (this.offsetSign[0] == 0)
            this.renderFace(this.frontFace, this.frontRenderJob, this.backNeighbor, this.colorHex100);
        else
            this.renderFace(this.backFace, this.backRenderJob, this.frontNeighbor, this.colorHex100);

        if (this.offsetSign[1] == 0)
            this.renderFace(this.bottomFace, this.bottomRenderJob, this.topNeighbor, this.colorHex010);
        else
            this.renderFace(this.topFace, this.topRenderJob, this.bottomNeighbor, this.colorHex010);

        if (this.offsetSign[2] == 0)
            this.renderFace(this.rightFace, this.rightRenderJob, this.leftNeighbor, this.colorHex001);
        else
            this.renderFace(this.leftFace, this.leftRenderJob, this.rightNeighbor, this.colorHex001);
    }
}