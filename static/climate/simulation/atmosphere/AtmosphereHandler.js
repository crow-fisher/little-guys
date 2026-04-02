import { COLOR_VERY_FUCKING_RED } from "../../../colors.js";
import { GBA, GBDD, GBDR, GBDU, GBSR, isButtonPressed } from "../../../gamepad.js";
import { DEBUG } from "../../../index.js";
import { gfc } from "../../../rendering/camera.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { addRenderJob } from "../../../rendering/rasterizer.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors, copyVecValue, multiplyVectorByScalar, subtractVectorsDest } from "../../stars/matrix.js";
import { getCurDay } from "../../time.js";
import { AtmosphereUnit } from "./model/AtmosphereUnit.js";


const F = Math.floor

export class AtmosphereHandler {
    constructor() {
        this.au = new Map(); // 3-D map to individuals sectors of XYZ space
        this.fullAUList = new Array(); // 1-D array array of all live AUs
        this.tickAUList = new Array();
        this.dist = 8;
    }

    initAtmosphereUnits() {
        this.ns = this.dist;
        this.x = F(this.ccp[0]);
        this.y = F(this.ccp[1]);
        this.z = F(this.ccp[2]);
        this.xm;
        this.ym;
        this.zm;
        this.cau;

        this.i = 0;
        for (let i = -this.ns; i < this.ns; i++) {
            this.au.set(this.x + i, this.au.get(this.x + i) ?? new Map());
            this.xm = this.au.get(this.x + i);
            for (let j = -this.ns; j < this.ns; j++) {
                this.xm.set(this.y + j, this.xm.get(this.y + j) ?? new Map());
                this.ym = this.xm.get(this.y + j);
                for (let k = -this.ns; k < this.ns; k++) {
                    let sector = [this.x + i, this.y + j, this.z + k];
                    if (this.indexAtmosphereUnit(sector) == null) {
                        this.cau = new AtmosphereUnit(sector);
                        this.fullAUList.push(this.cau);
                        this.ym.set(this.z + k, this.cau);
                    }
                    this.tickAUList[this.i] = this.ym.get(this.z + k);
                    this.i += 1;
                }
            }
        };
        this.tickAUList.length = this.i;
        this.tickAUList.sort((a, b) => a.cd - b.cd);

        if (this.fullAUList.length > (this.tickAUList.length * 10)) {
            this.au.clear();
            this.fullAUList.length = 0;
            this.initAtmosphereUnits();
        }
    }

    indexAtmosphereUnit(sector) {
        return this.au
            .get(Math.floor(sector[0]))
            ?.get(Math.floor(sector[1]))
            ?.get(Math.floor(sector[2]));
    }

    getSectorOffset(sector, dx, dy, dz) {
        return this.au
            .get(Math.floor(sector[0]) + dx)
            ?.get(Math.floor(sector[1]) + dy)
            ?.get(Math.floor(sector[2]) + dz);
    }

    diffusionModelTick() {
        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].diffusionModel();
        }
        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].applyFlow();
        }
    }

    gamepadInputTick() {
        this._ccpOffset = this._ccpOffset ?? [0, 0, 0];
        addVec3Dest(this.ccp, [1, 0, 1], this._ccpOffset);
        this._cuOffset = this.indexAtmosphereUnit(this._ccpOffset);

        // this._cuOffset.debugRenderInit(this.ccp);
        // this._cuOffset.debugRenderFlowTick();
        // this._cuOffset.diffusionModel();

        if (isButtonPressed(GBA) || isButtonPressed(GBDU)) {
            this.cu.pressure += 4;
        }
        if (isButtonPressed(GBDD)) {
            this.cu.pressure *= 0.5;
        }


    }

    tick() {
        this.ccp = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
        this.initAtmosphereUnits();
        this.cu = this.indexAtmosphereUnit(this.ccp);

        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].preTick(this);
        }

        this.gamepadInputTick();
        this.diffusionModelTick();

        if (DEBUG)
            this.debugRenderTick();

    }

    debugRenderTick() {
        let cur;
        // for (let i = 0; i < this.i; i++) {
        //     cur = this.tickAUList[i];
        //     cur.debugRender(this.ccp);
        // }
        this.debugRenderWindSpeedGrid();
        this.cu.debugRender(this.ccp)
    }

    getWindSpeedAtLocation(loc) {
        let out = [0, 0, 0];
        // return multiplyVectorByScalar([Math.sin(getCurDay() * 10 **4), Math.cos(getCurDay() * 10 **4), 1], .5)
        this._wslWsq = this.indexAtmosphereUnit(loc);

        if (this._wslWsq == null) {
            return out;
        }

        this._wslWsq.applyWindSpeed(loc, out, true);
        return out;
    }

    debugRenderWindSpeedGrid() {
        this.tickAUList.forEach((au) => {
            au._startLoc = [0, 0, 0];
            au._endLoc = [0, 0, 0];

            addVec3Dest(au.sector, [0.5, 0.5, 0.5], au._startLoc);
            // addVec3Dest(au.sector, [
            //    .1 * Math.sin(getCurDay() * 10 ** 4),
            //    .1 * Math.sin(getCurDay() * 10 ** 4),
            //    .1 * Math.sin(getCurDay() * 10 ** 4)
            // ], au._startLoc);

            addVec3Dest(au._startLoc, this.getWindSpeedAtLocation(au._startLoc), au._endLoc);
            
            au._startTcs = new CoordinateSet (au._startLoc);
            au._endTcs = new CoordinateSet(au._endLoc);

            addRenderJob(new LineRenderJob(
                au._startTcs.renderScreen,
                au._endTcs.renderScreen,
                4 / au.cd,
                COLOR_VERY_FUCKING_RED
            ), false);
        })
    }
}
