import { getCanvasHeight, getCanvasWidth } from "../../../../canvas.js";
import { COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../../colors.js";
import { debugRenderLine, debugRenderLineOffsetPoints } from "../../../../rendering/camera.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../../rendering/rasterizer.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET } from "../../../../ui/UIData.js";
import { addVec3Dest, addVectors, copyVecValue, getVec3Length, multiplyVectorByScalar, multiplyVectorByScalarDest, subtractVectors, subtractVectorsDest } from "../../../stars/matrix.js";
import { getCurDay } from "../../../time.js";



export const ATMOSCALE = 16;

export class AtmosphereUnit {
    constructor(sector, size) { // vec3s
        this.sector = sector;
        this.size = size;
        this.pressure = 1;
        this.cd = -1; // camera dist. in sectors. euclidian distance.
        this.flow = new Map();
        this.windSpeed = [0, 0, 0];

        this.nLeft;
        this.nRight;
        this.nTop;
        this.nBottom;
        this.nFront;
        this.nBack;
    }

    preTick(mgr) {
        this.initNeighbors(mgr);
        this.cd = (
            (((this.sector[0] * ATMOSCALE) + 0.5) - mgr.ccp[0]) ** 2 +
            (((this.sector[1] * ATMOSCALE) + 0.5) - mgr.ccp[1]) ** 2 +
            (((this.sector[2] * ATMOSCALE) + 0.5) - mgr.ccp[2]) ** 2) ** 0.5 / ATMOSCALE;

        this.initFlow();

        if (this.pressure > 1)
            this.pressure *= 0.9;
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
        this._appliedDiff = -this._neighborDiff * 0.07; // if this number is much higher than this, the entire thing breaks down

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
        this._sectorRefDelta = this._sectorRefDelta ?? [0, 0, 0];
        this._sectorFlowMult = this._sectorFlowMult ?? [0, 0, 0];

        subtractVectorsDest(this.sector, loc, this._sectorRefDelta);
        this._sectorLocDistance = getVec3Length(this._sectorRefDelta);

        this.flow.entries().forEach((entry) => {
            this._sectorRef = this.fkts(entry.at(0));
            multiplyVectorByScalarDest(this._sectorRef,  entry.at(1) / (1 + this._sectorLocDistance) ** 2, this._sectorFlowMult);
            subtractVectors(out, this._sectorFlowMult);
        });
    }

    tickWindSpeed() {
        this._sectorFlowMult = this._sectorFlowMult ?? [0, 0, 0];
        copyVecValue([0, 0, 0], this.windSpeed);
        this.flow.entries().forEach((entry) => {
            this._sectorRef = this.fkts(entry.at(0));
            multiplyVectorByScalarDest(this._sectorRef,  entry.at(1), this._sectorFlowMult);
            subtractVectors(this.windSpeed, this._sectorFlowMult);
        });
    }

    debugRender(ccp, dist) {
        this.debugRenderInit(ccp);
        if (!this._tcsCenter.isVisibleOnScreen()) {
            return;
        }
        if (this.cd > (dist - 4) && this.cd < (dist + 1)) {
            this.debugRenderBounds();
            this.debugRenderWind();
        }

        // if (this.cd < 2) {
        //     this.debugRenderBounds();
        // }
        // if (this.cd < 3) {
        //     this.debugRenderDiffusionFlow();
        // }
        // if (this.cd < 2) {
        //     this.debugRenderFlow(ccp);
        // }

    }

    debugRenderWind() {
        this._windStartCoords = this._windStartCoords ?? [0, 0, 0];
        this._windEndCoords = this._windEndCoords ?? [0, 0, 0];
        this._appliedWindSpeed = this._appliedWindSpeed ?? [0, 0, 0];

        copyVecValue(this.sector, this._windStartCoords);
        addVectors(this._windStartCoords, [0.5, 0.5, 0.5]);
        multiplyVectorByScalar(this._windStartCoords, ATMOSCALE);

        multiplyVectorByScalarDest(this.windSpeed, ATMOSCALE, this._appliedWindSpeed)
        addVec3Dest(this._windStartCoords, this._appliedWindSpeed, this._windEndCoords);

        this._windStartSt = this._windStartSt ?? new CoordinateSet();
        this._windEndSt = this._windEndSt ?? new CoordinateSet();

        this._windStartSt.setWorld(this._windStartCoords)
        this._windEndSt.setWorld(this._windEndCoords)

        if (this._windRenderJob == null) {
            this._windRenderJob = new LineRenderJob(
            this._windStartSt.renderScreen,
            this._windEndSt.renderScreen,
            // 4 / st.distToCamera,
            4,
            COLOR_VERY_FUCKING_RED);
        } else {
            this._windRenderJob.v1 = this._windStartSt.renderScreen;
            this._windRenderJob.v2 = this._windEndSt.renderScreen;
        }

        addRenderJob(this._windRenderJob);

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
                    .4 / (this.cd ** 2),
                    COLOR_BLUE
                ), false);
        });
    }

    debugRenderInit(ccp) {
        this._x1 = ATMOSCALE * (this.sector[0]);
        this._x2 = ATMOSCALE * (this.sector[0] + 1);
        this._y1 = ATMOSCALE * (this.sector[1]);
        this._y2 = ATMOSCALE * (this.sector[1] + 1);
        this._z1 = ATMOSCALE * (this.sector[2]);
        this._z2 = ATMOSCALE * (this.sector[2] + 1);
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
            debugRenderLine(start, end, color, 10);
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

    debugRenderFlow(ccp, neighbors=false) {
        this.debugRenderInit(ccp)
        this.flowString = "";
        this.flowString += "\n" + this.flow.get(this.stfk([-1, 0, 0])).toFixed(4);
        this.flowString += "\n" + this.flow.get(this.stfk([1, 0, 0])).toFixed(4);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 1, 0])).toFixed(4);
        this.flowString += "\n" + this.flow.get(this.stfk([0, -1, 0])).toFixed(4);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 0, 1])).toFixed(4);
        this.flowString += "\n" + this.flow.get(this.stfk([0, 0, -1])).toFixed(4);
        addRenderJob(new PointLabelRenderJob(
                this._tcsCenter.renderScreen[0],
                this._tcsCenter.renderScreen[1],
                this._tcsCenter.screen[2],
                Math.min(20, 10 / this.cd),
                COLOR_BLUE,
                this.flowString),
                false);

        if (neighbors) {
            this.nRight.debugRenderFlow(ccp)
            this.nLeft.debugRenderFlow(ccp, this.cd < 4)
            this.nRight.debugRenderFlow(ccp)
            this.nTop.debugRenderFlow(ccp)
            this.nBottom.debugRenderFlow(ccp)
            this.nFront.debugRenderFlow(ccp)
            this.nBack.debugRenderFlow(ccp)
        }
    }
}

export function vec3ToString(vec3, digits) {
    let out = "";
    out += vec3[0].toFixed(digits) + "|";
    out += vec3[1].toFixed(digits) + "|";
    out += vec3[2].toFixed(digits);

    return out;
}