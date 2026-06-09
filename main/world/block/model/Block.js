import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { QuadRenderJob } from "../../../rendering/model/QuadRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderPointLabel, renderQuad } from "../../../rendering/renderFunctions.js";
import { centerVec, nnnVec, nnpVec, npnVec, nppVec, pnnVec, pnpVec, ppnVec, pppVec } from "../../../util/const.js";


export class Block {
    constructor(blockManager, cartesian) {
        this.blockManager = blockManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.cartesian = cartesian;
        this.sector = blockManager.cartesianToSector(cartesian);

        this.centerCs = new CoordinateSet(this.cameraManager, this.cartesian, centerVec);
        this.nnnCs = new CoordinateSet(this.cameraManager, this.cartesian, nnnVec);
        this.nnpCs = new CoordinateSet(this.cameraManager, this.cartesian, nnpVec);
        this.npnCs = new CoordinateSet(this.cameraManager, this.cartesian, npnVec);
        this.nppCs = new CoordinateSet(this.cameraManager, this.cartesian, nppVec);
        this.pnnCs = new CoordinateSet(this.cameraManager, this.cartesian, pnnVec);
        this.pnpCs = new CoordinateSet(this.cameraManager, this.cartesian, pnpVec);
        this.ppnCs = new CoordinateSet(this.cameraManager, this.cartesian, ppnVec);
        this.pppCs = new CoordinateSet(this.cameraManager, this.cartesian, pppVec);

        this.frontFace = [this.pnnCs, this.pnpCs, this.pppCs, this.ppnCs]
        this.backFace = [this.nnnCs, this.nnpCs, this.nppCs, this.npnCs]
        this.frontRenderJob = new QuadRenderJob(this.rasterizationManager)
        this.backRenderJob = new QuadRenderJob(this.rasterizationManager)

        this.bottomFace = [this.npnCs, this.nppCs, this.pppCs, this.ppnCs];
        this.topFace = [this.nnnCs, this.nnpCs, this.pnpCs, this.pnnCs];
        this.bottomRenderJob = new QuadRenderJob(this.rasterizationManager)
        this.topRenderJob = new QuadRenderJob(this.rasterizationManager)

        this.rightFace = [this.nnpCs, this.nppCs, this.pppCs, this.pnpCs];
        this.leftFace = [this.nnnCs, this.npnCs, this.ppnCs, this.pnnCs];
        this.rightRenderJob = new QuadRenderJob(this.rasterizationManager)
        this.leftRenderJob = new QuadRenderJob(this.rasterizationManager)

        this.offsetSign = [0, 0, 0];
    }

    color() {
        return hsvToHex(this.centerCs.distToCamera * 10, .8, .6);
    }

    renderFace(face, renderJob) {
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
        this.centerCs.process();
        this.nnnCs.process();
        this.nnpCs.process();
        this.npnCs.process();
        this.nppCs.process();
        this.pnnCs.process();
        this.pnpCs.process();
        this.ppnCs.process();
        this.pppCs.process();
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
        if (!this.centerCs.isVisibleOnScreen()) {
            return;
        }
        this.offsetSign[0] = (this.centerCs.offset[0] < 0) ? 0 : 1;
        this.offsetSign[1] = (this.centerCs.offset[1] < 0) ? 0 : 1;
        this.offsetSign[2] = (this.centerCs.offset[2] < 0) ? 0 : 1;

        // this.renderPoint(this.nnnCs)
        // this.renderPoint(this.nnpCs)
        // this.renderPoint(this.npnCs)
        // this.renderPoint(this.nppCs)
        // this.renderPoint(this.pnnCs)
        // this.renderPoint(this.pnpCs)
        // this.renderPoint(this.ppnCs)
        // this.renderPoint(this.pppCs)

        if (this.offsetSign[0] == 0)
            this.renderFace(this.frontFace, this.frontRenderJob);
        else
            this.renderFace(this.backFace, this.backRenderJob);

        if (this.offsetSign[1] == 0)
            this.renderFace(this.bottomFace, this.bottomRenderJob);
        else
            this.renderFace(this.topFace, this.topRenderJob);

        if (this.offsetSign[2] == 0)
            this.renderFace(this.rightFace, this.rightRenderJob);
        else
            this.renderFace(this.leftFace, this.leftRenderJob);


    }
}