import { COLOR_VERY_FUCKING_RED } from "../../../colors.js";
import { GBA, GBDD, GBDR, GBDU, GBSR, isButtonPressed } from "../../../gamepad.js";
import { DEBUG } from "../../../index.js";
import { gfc } from "../../../rendering/camera.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../rendering/rasterizer.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors, copyVecValue, getVec3Length, multiplyVectorByScalar, subtractVectorsDest } from "../../stars/matrix.js";
import { getCurDay } from "../../time.js";
import { AtmosphereUnit, vec3ToString } from "./model/AtmosphereUnit.js";


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
        let scale = 10;
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
        if (isButtonPressed(GBA) || isButtonPressed(GBDU)) {
            this.addPressureAtLocation(this.cu.sector, 2, 40);
        }
    }

    addPressureAtLocation(loc, dist, amount) {
        let cdv = [0, 0, 0];
        for (let i = 0; i < this.i; i++) {
            subtractVectorsDest(loc, this.tickAUList[i].sector, cdv);
            if (getVec3Length(cdv) < dist) {
                this.tickAUList[i].pressure += amount;
            }
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

        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].tickWindSpeed();
        }

        if (DEBUG)
            this.debugRenderTick();

    }

    debugRenderTick() {
        // let cur;
        // for (let i = 0; i < this.i; i++) {
        //     cur = this.tickAUList[i];
        //     cur.debugRender(this.ccp);
        // }

        this.cu.debugRenderInit(this.ccp);
        this.cu.debugRenderBounds();

        this.debugRenderWindSpeedGrid();
    }

    getWindSpeedAtLocation(loc) {
        this._wslWsq = this.indexAtmosphereUnit(loc);
        if (this._wslWsq == null) {
            return [0, 0, 0];
        }
        return this._wslWsq.windSpeed;
    }

    debugRenderWindSpeedGrid() {
        let range = 40; 
        let step = 2;

        let startDist = 0;

        let co = gfc().cameraOffset;

        let cof = structuredClone(co);
        cof[0] = Math.floor(cof[0])
        cof[1] = Math.floor(cof[1])
        cof[2] = Math.floor(cof[2])

        for (let i = -range; i < range; i += step) {
            for (let j = -range; j < range; j += step) {
                for (let k = -range; k < range; k += step) {
                    let sl = [0, 0, 0];
                    let el = [0, 0, 0];

                    addVec3Dest(cof, [i, j, k], sl);
                    let st = new CoordinateSet (sl);
                    
                    if (!st.isVisibleOnScreen())
                        continue;

                    let wsVec = this.getWindSpeedAtLocation(sl);
                    addVec3Dest(sl, wsVec, el);
                    let et = new CoordinateSet(el);

                    addRenderJob(new LineRenderJob(
                        st.renderScreen,
                        et.renderScreen,
                        4 / st.distToCamera,
                        COLOR_VERY_FUCKING_RED
                    ), true);
                }
            }
        }
    }
}
