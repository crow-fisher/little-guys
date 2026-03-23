import { getCanvasHeight, getCanvasWidth } from "../../../../canvas.js";
import { COLOR_BLUE, COLOR_GREEN, COLOR_OTHER_BLUE, COLOR_RED, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../../colors.js";
import { MAIN_CONTEXT } from "../../../../index.js";
import { debugRenderLineOffsetPoints } from "../../../../rendering/camera.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../../rendering/rasterizer.js";
import { loadEmptyScene } from "../../../../saveAndLoad.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET } from "../../../../ui/UIData.js";
import { addVec3Dest, addVectors, copyVecValue, getVec3Length, multiplyVectorByScalar, multiplyVectorByScalarDest, multiplyVectorsDest, normalizeVec3, subtractVectors, subtractVectorsDest, VEC3 } from "../../../stars/matrix.js";
import { getCurDay } from "../../../time.js";



export class AtmosphereUnit {
    constructor(sector, size) { // vec3s
        this.sector = sector;
        this.size = size;
        this.pressure = 1;
        this.cd = -1; // camera dist. in sectors. euclidian distance.
        this.inFlow = [0, 0, 0]
        this.outFlow = [0, 0, 0]
        this.nTop;
        this.nBottom;
        this.nLeft;
        this.nRight;
        this.nFront;
        this.nBottom;
    }

    preTick(mgr) {
        this.initNeighbors(mgr);
        this.cd = (
            (this.sector[0] - mgr.ccp[0]) ** 2 +
            (this.sector[1] - mgr.ccp[1]) ** 2 +
            (this.sector[2] - mgr.ccp[2]) ** 2) ** 0.5;
        copyVecValue(VEC3, this.inFlow);
        copyVecValue(VEC3, this.outFlow);
    }

    initNeighbors(manager) {
        this.nLeft = this.nLeft ?? manager.getSectorOffset(this.sector, -1, 0, 0)
        this.nRight = this.nRight ?? manager.getSectorOffset(this.sector, 1, 0, 0)
        this.nTop = this.nTop ?? manager.getSectorOffset(this.sector, 0, -1, 0)
        this.nBottom = this.nBottom ?? manager.getSectorOffset(this.sector, 0, 1, 0)
        this.nFront = this.nFront ?? manager.getSectorOffset(this.sector, 0, 0, -1)
        this.nBack = this.nBack ?? manager.getSectorOffset(this.sector, 0, 0, 1)
    }

    diffusionModel() {
        if (this.pressure == 1) {
            return;
        }
        this._diffusionSquareTick(this.nRight);
        this._diffusionSquareTick(this.nLeft);
        this._diffusionSquareTick(this.nRight);
        this._diffusionSquareTick(this.nTop);
        this._diffusionSquareTick(this.nBottom);
        this._diffusionSquareTick(this.nFront);
        this._diffusionSquareTick(this.nBack);
    }

    _diffusionSquareTick(neighbor) {
        if (neighbor == null) {
            return;
        }
        // relative position - vector
        this._sectorDiff = this._sectorDiff ?? [0, 0, 0];
        subtractVectorsDest(this.sector, neighbor.sector, this._sectorDiff);
        // magnitude of flow - scalar. 
        // if positive, pressure flows out from here to neighbor. 
        this._neighborDiff = this.pressure - neighbor.pressure;
        if (this._neighborDiff > 0) {
            this._appliedDiff = this._neighborDiff * 0.1;
            multiplyVectorByScalar(this._sectorDiff, this._appliedDiff);
            addVectors(this.outFlow, this._sectorDiff);
            addVectors(neighbor.inFlow, this._sectorDiff);
        }


    }

    shouldRenderDebug(ccp) {
        if (
            this._tcsCenter.renderScreen[0] < 0 || this._tcsCenter.renderScreen[0] > getCanvasWidth() &&
            this._tcsCenter.renderScreen[1] < 0 && this._tcsCenter.renderScreen[1] > getCanvasHeight()) {
            return false;
        }

        this._sectorDiff = this._sectorDiff ?? [0, 0, 0];
        subtractVectorsDest(this._centerRoot, ccp, this._sectorDiff);
        
        if (Math.abs(this._sectorDiff[1]) > 2) {
            return false;
        }

        // if (Math.abs(this._sectorDiff[0]) > 4) {
        //     return false;
        // }


        return true;
    }

    debugRender(ccp) {
        this.debugRenderInit(ccp);
        if (this.shouldRenderDebug(ccp)) {
            this.debugRenderLabel();
            this.debugRenderBounds();
            this.debugRenderDiffusionFlow();
        }
    }

    debugRenderDiffusionFlow() {
        // this.flow = [Math.sin(10 ** 4 * getCurDay()), 0, Math.cos(10 ** 4 * getCurDay())]

        return;

        this._tcsRootFlow = this._tcsRootFlow ?? [0, 0, 0];
        this._flowMult = this._flowMult ?? [0, 0, 0];
        multiplyVectorByScalarDest(this.flow, -40, this._flowMult);

        addVec3Dest(this._centerRoot, this._flowMult, this._tcsRootFlow);

        this._tcsFlow = new CoordinateSet(this._tcsRootFlow);

        addRenderJob(new LineRenderJob(
            this._tcsCenter.renderScreen,
            this._tcsFlow.renderScreen,
            10 / this.cd,
            COLOR_VERY_FUCKING_RED
        ), false);


        addRenderJob(new PointLabelRenderJob(
            this._tcsFlow.renderScreen[0],
            this._tcsFlow.renderScreen[1],
            this._tcsFlow.screen[2],
            15 / this.cd,
            COLOR_RED,
            null),
            false);

    }

    debugRenderInit(ccp) {
        this._x1 = this.sector[0];
        this._x2 = this.sector[0] + 1;
        this._y1 = this.sector[1];
        this._y2 = this.sector[1] + 1;
        this._z1 = this.sector[2];
        this._z2 = this.sector[2] + 1;

        this._x1 -= ccp[0];
        this._x2 -= ccp[0];
        this._y1 -= ccp[1];
        this._y2 -= ccp[1];
        this._z1 -= ccp[2];
        this._z2 -= ccp[2];

        this._tcsRoot = this._tcsRoot ?? [0, 0, 0];
        addVec3Dest(this.sector, loadGD(UI_CAMERA_CENTER_SELECT_OFFSET), this._tcsRoot);
        this._tcs = new CoordinateSet(this._tcsRoot);

        this._centerRoot = this._centerRoot ?? [0, 0, 0];
        addVec3Dest(this._tcsRoot, [0.5, 0.5, 0.5], this._centerRoot);
        this._tcsCenter = new CoordinateSet(this._centerRoot);
    }

    debugRenderBounds() {
        let lines = [
            [
                [this._x1, this._y1, this._z1],
                [this._x2, this._y1, this._z1],
                COLOR_BLUE
            ],
            [
                [this._x2, this._y1, this._z1],
                [this._x2, this._y2, this._z1],
                COLOR_RED
            ],
            [
                [this._x2, this._y2, this._z1],
                [this._x1, this._y2, this._z1],
                COLOR_BLUE
            ],
            [
                [this._x1, this._y2, this._z1],
                [this._x1, this._y1, this._z1],
                COLOR_RED
            ],
            [
                [this._x1, this._y1, this._z2],
                [this._x2, this._y1, this._z2],
                COLOR_BLUE
            ],
            [
                [this._x2, this._y1, this._z2],
                [this._x2, this._y2, this._z2],
                COLOR_RED
            ],
            [
                [this._x2, this._y2, this._z2],
                [this._x1, this._y2, this._z2],
                COLOR_BLUE
            ],
            [
                [this._x1, this._y2, this._z2],
                [this._x1, this._y1, this._z2],
                COLOR_RED
            ],
            [
                [this._x1, this._y1, this._z1],
                [this._x1, this._y1, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x2, this._y1, this._z1],
                [this._x2, this._y1, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x1, this._y2, this._z1],
                [this._x1, this._y2, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x2, this._y2, this._z1],
                [this._x2, this._y2, this._z2],
                COLOR_OTHER_BLUE
            ]
        ];

        lines.forEach((line) => {
            let start = line[0];
            let end = line[1];
            let color = line[2];
            debugRenderLineOffsetPoints(start, end, color, 3 / this.cd);
        });
    }

    debugRenderLabel() {

        this.digits = 8;

        if (this.pressure > 1 + 10 ** (-this.digits))
            addRenderJob(new PointLabelRenderJob(
                this._tcsCenter.renderScreen[0],
                this._tcsCenter.renderScreen[1],
                this._tcsCenter.screen[2],
                Math.min(20, this.pressure * 10 / this.cd),
                COLOR_WHITE,
                this.pressure.toFixed(this.digits)),
                false);
    }
}

function printVec3(vec3) {
    let out = "";
    out += vec3[0].toFixed(0) + "|";
    out += vec3[1].toFixed(0) + "|";
    out += vec3[2].toFixed(8);

    return out;
}