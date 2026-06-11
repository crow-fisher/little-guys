import { hsvToHex, rgbToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { QuadRenderJob } from "../../../rendering/model/QuadRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderPointLabel, renderQuad } from "../../../rendering/renderFunctions.js";
import { centerVec, nnnVec, nnpVec, npnVec, nppVec, pnnVec, pnpVec, ppnVec, pppVec } from "../../../util/const.js";
import { addVectors, multiplyVectorsDest } from "../../../util/vector.js";


export class Block {
    constructor(blockManager, cartesian) {
        this.blockManager = blockManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.cartesian = cartesian;
        this.sector = blockManager.cartesianToSector(cartesian);

        this.lightSource = [];
        this.lightApplied = [1, 1, 1];
        
        this.colorBase = [100, 100, 100];
        this.colorApplied = [100, 100, 100]
        this.colorHex = "#646464";

        this.centerCs = new CoordinateSet(this.cameraManager, this.cartesian, centerVec);
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
        
        this.lightApplied[0] = 0;
        this.lightApplied[1] = 0;
        this.lightApplied[2] = 0;
        this.lightSource.forEach((ls) => addVectors(this.lightApplied, ls[1]))

        // calculate final color based on 'lightApplied' and 'colorBase'
        multiplyVectorsDest(this.colorBase, this.lightApplied, this.colorApplied);
        this.colorHex = rgbToHex(...this.colorApplied)
        return this.colorHex;
    }

    renderFace(face, renderJob, neighbor) {
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

        renderJob.color = this.color();
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
        this.offsetSign[0] = (this.centerCs.offset[0] < 0) ? 0 : 1;
        this.offsetSign[1] = (this.centerCs.offset[1] < 0) ? 0 : 1;
        this.offsetSign[2] = (this.centerCs.offset[2] < 0) ? 0 : 1;

        if (this.offsetSign[0] == 0)
            this.renderFace(this.frontFace, this.frontRenderJob, this.backNeighbor);
        else
            this.renderFace(this.backFace, this.backRenderJob, this.frontNeighbor);

        if (this.offsetSign[1] == 0)
            this.renderFace(this.bottomFace, this.bottomRenderJob, this.topNeighbor);
        else
            this.renderFace(this.topFace, this.topRenderJob, this.bottomNeighbor);

        if (this.offsetSign[2] == 0)
            this.renderFace(this.rightFace, this.rightRenderJob, this.leftNeighbor);
        else
            this.renderFace(this.leftFace, this.leftRenderJob, this.rightNeighbor);


    }
}