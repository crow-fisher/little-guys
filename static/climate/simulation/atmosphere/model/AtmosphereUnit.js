import { getCanvasHeight, getCanvasWidth } from "../../../../canvas.js";
import { COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../../colors.js";
import { debugRenderLineOffsetPoints } from "../../../../rendering/camera.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../../rendering/rasterizer.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET } from "../../../../ui/UIData.js";
import { addVec3Dest, addVectors, copyVecValue, getVec3Length, multiplyVectorByScalar, multiplyVectorByScalarDest, subtractVectors, subtractVectorsDest } from "../../../stars/matrix.js";
import { getCurDay } from "../../../time.js";


export class AtmosphereUnit {
    constructor(sector, size) { // vec3s
        this.sector = sector;
        this.size = size;
        this.pressure = 1;
        this.cd = -1; // camera dist. in sectors. euclidian distance.
        this.flow = new Map();
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

        this.initFlow();
    }

    stfk(sector) {
        // sector to flow key
        return JSON.stringify(sector);
    }

    fkts(flowKey) {
        // flow key to sector
        return JSON.parse(flowKey);
    }


    initFlow() {
        // this.flow.set(this.stfk([-1, 0, 0]), 0.7 * (this.flow.get(this.stfk([-1, 0, 0])) ?? 0));
        // this.flow.set(this.stfk([1, 0, 0]), 0.7 * (this.flow.get(this.stfk([1, 0, 0])) ?? 0));
        // this.flow.set(this.stfk([0, 1, 0]), 0.7 * (this.flow.get(this.stfk([0, 1, 0])) ?? 0));
        // this.flow.set(this.stfk([0, -1, 0]), 0.7 * (this.flow.get(this.stfk([0, -1, 0])) ?? 0));
        // this.flow.set(this.stfk([0, 0, 1]), 0.7 * (this.flow.get(this.stfk([0, 0, 1])) ?? 0));
        // this.flow.set(this.stfk([0, 0, -1]), 0.7 * (this.flow.get(this.stfk([0, 0, -1])) ?? 0));


        this.flow.set(this.stfk([-1, 0, 0]), 0);
        this.flow.set(this.stfk([1, 0, 0]), 0);
        this.flow.set(this.stfk([0, 1, 0]), 0);
        this.flow.set(this.stfk([0, -1, 0]), 0);
        this.flow.set(this.stfk([0, 0, 1]), 0);
        this.flow.set(this.stfk([0, 0, -1]), 0);
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
        this._sectorOffset = this._sectorOffset ?? [0, 0, 0];
        this._sectorOffsetFlip = this._sectorOffsetFlip ?? [0, 0, 0];
        
        subtractVectorsDest(neighbor.sector, this.sector, this._sectorOffset);
        multiplyVectorByScalarDest(this._sectorOffset, -1, this._sectorOffsetFlip);

        this._neighborDiff = this.pressure - neighbor.pressure;
        this._appliedDiff = -this._neighborDiff * 0.05;

        this.flow.set(this.stfk(this._sectorOffset), this.flow.get(this.stfk(this._sectorOffset)) + this._appliedDiff);
        neighbor.flow.set(this.stfk(this._sectorOffsetFlip), neighbor.flow.get(this.stfk(this._sectorOffsetFlip)) - this._appliedDiff);
    }

    applyFlow() {
        this.pressure += this.flow.get(this.stfk([-1, 0, 0]));
        this.pressure += this.flow.get(this.stfk([1, 0, 0]));
        this.pressure += this.flow.get(this.stfk([0, 1, 0]));
        this.pressure += this.flow.get(this.stfk([0, -1, 0]));
        this.pressure += this.flow.get(this.stfk([0, 0, 1]));
        this.pressure += this.flow.get(this.stfk([0, 0, -1]));
    }

    applyWindSpeed(loc, out, applyNeighbors) {
        this._sectorRefMidpoint = this._sectorRefMidpoint ?? [0, 0, 0];
        this._sectorRefDelta = this._sectorRefDelta ?? [0, 0, 0];
        this._sectorFlowMult = this._sectorFlowMult ?? [0, 0, 0];

        subtractVectorsDest(this.sector, loc, this._sectorRefDelta);
        this._sectorLocDistance = getVec3Length(this._sectorRefDelta);

        this.flow.entries().forEach((entry) => {
            this._sectorRef = this.fkts(entry.at(0));
            multiplyVectorByScalarDest(this._sectorRef,  entry.at(1), this._sectorFlowMult);
            addVectors(out, this._sectorFlowMult);
        });

        // if (applyNeighbors) {
        //     this.nRight?.applyWindSpeed(loc, out, false)
        //     this.nLeft?.applyWindSpeed(loc, out, false)
        //     this.nRight?.applyWindSpeed(loc, out, false)
        //     this.nTop?.applyWindSpeed(loc, out, false)
        //     this.nBottom?.applyWindSpeed(loc, out, false)
        //     this.nFront?.applyWindSpeed(loc, out, false)
        //     this.nBack?.applyWindSpeed(loc, out, false)
        // }
    }

    shouldRenderDebug(ccp) {
        if (
            this._tcsCenter.renderScreen[0] < 0 || this._tcsCenter.renderScreen[0] > getCanvasWidth() &&
            this._tcsCenter.renderScreen[1] < 0 && this._tcsCenter.renderScreen[1] > getCanvasHeight()) {
            return false;
        }
        this._sectorOffset = this._sectorOffset ?? [0, 0, 0];
        subtractVectorsDest(this._centerRoot, ccp, this._sectorOffset);
        return this.cd < 4;
    }

    debugRender(ccp) {
        this.debugRenderInit(ccp);
        if (this.shouldRenderDebug(ccp)) {
            this.debugRenderBounds();
            this.debugRenderDiffusionFlow();
        }
    }


    debugRenderDiffusionFlow() {
        this._sectorRef = this._sectorRef ?? [0, 0, 0];
        this._tcsRootFlow = this._tcsRootFlow ?? [0, 0, 0];
        this._flowMult = this._flowMult ?? [0, 0, 0];
        
        this.flow.entries().forEach((entry) => {
                this._sectorRef = this.fkts(entry.at(0));
                multiplyVectorByScalarDest(this._sectorRef, entry.at(1), this._flowMult);
                addVec3Dest(this._centerRoot, this._flowMult, this._tcsRootFlow);
                this._tcsFlow = new CoordinateSet(this._tcsRootFlow);
                addRenderJob(new LineRenderJob(
                    this._tcsCenter.renderScreen,
                    this._tcsFlow.renderScreen,
                    10 / this.cd,
                    COLOR_BLUE
                ), false);
        });
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

    debugRenderLabel(ccp, neighbors=false) {
        this.digits = 8;
        this.debugRenderInit(ccp)
        addRenderJob(new PointLabelRenderJob(
            this._tcsCenter.renderScreen[0],
            this._tcsCenter.renderScreen[1],
            this._tcsCenter.screen[2],
            Math.min(20, this.pressure * 10 / this.cd),
            COLOR_WHITE,
            this.pressure.toFixed(this.digits)),
            false);

        if (neighbors) {
            this.nRight.debugRenderLabel(ccp)
            this.nLeft?.debugRenderLabel(ccp, this.cd < 4)
            this.nRight.debugRenderLabel(ccp)
            this.nTop.debugRenderLabel(ccp)
            this.nBottom.debugRenderLabel(ccp)
            this.nFront.debugRenderLabel(ccp)
            this.nBack.debugRenderLabel(ccp)
        }
    }

    debugRenderFlowTick() {
        this.flowString = "";
        this.flowString += "\n" + this.flow.get(this.stfk([-1, 0, 0])).toFixed(8);
        this.flowString += "\n" + this.flow.get(this.stfk([1, 0, 0])).toFixed(8);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 1, 0])).toFixed(8);
        this.flowString += "\n" + this.flow.get(this.stfk([0, -1, 0])).toFixed(8);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 0, 1])).toFixed(8);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 0, -1])).toFixed(8);
        addRenderJob(new PointLabelRenderJob(
                this._tcsCenter.renderScreen[0],
                this._tcsCenter.renderScreen[1],
                this._tcsCenter.screen[2],
                Math.min(20, this.pressure * 30 / this.cd),
                COLOR_BLUE,
                this.flowString),
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