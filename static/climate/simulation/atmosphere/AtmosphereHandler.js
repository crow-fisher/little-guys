import { GBA, GBDU, isButtonPressed } from "../../../gamepad.js";
import { DEBUG } from "../../../index.js";
import { getForwardVec } from "../../../rendering/camera.js";
import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVectors, copyVecValue, getVec3Length, multiplyVectorByScalarDest, subtractVectorsDest } from "../../stars/matrix.js";
import { ATMOSCALE, AtmosphereUnit } from "./model/AtmosphereUnit.js";


const F = Math.floor
const A = Math.abs
export let ahf = 0; // atmosphere handler frame

export class AtmosphereHandler {
    constructor() {
        this.au = new Map(); // 3-D map to individuals sectors of XYZ space
        this.fullAUList = new Array(); // 1-D array array of all live AUs
        this.tickAUList = new Array();
        this.dist = 5;
    }

    initAtmosphereUnits() {
        this.ns = this.dist;
        this.x = F(this.ccp[0] / ATMOSCALE);
        this.y = F(this.ccp[1] / ATMOSCALE);
        this.z = F(this.ccp[2] / ATMOSCALE);
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
                    if (this.indexAtmosphereUnitDirect(sector) == null) {
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

    indexAtmosphereUnitDirect(sector) {
        return this.indexAtmosphereUnitDirectParams(...sector);
    }
    indexAtmosphereUnitDirectParams(x, y, z) {
        return this.au
            .get(x)
            ?.get(y)
            ?.get(z);
    }

    indexAtmosphereUnit(loc) {
        return this.indexAtmosphereUnitDirectParams(
            Math.floor(loc[0] / ATMOSCALE), 
            Math.floor(loc[1] / ATMOSCALE), 
            Math.floor(loc[2] / ATMOSCALE)
        );
    }

    getSectorOffset(sector, dx, dy, dz) {
        let r = this.au
            .get(Math.floor(sector[0]) + dx)
            ?.get(Math.floor(sector[1]) + dy)
            ?.get(Math.floor(sector[2]) + dz);
        if (r?.ahf == ahf) {
            return r;
        }
        return null;
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
        if (isButtonPressed(GBA) || isButtonPressed(GBDU)) {
            this.addPressureRay(isButtonPressed(GBDU));
            // this.addPressureAtLocation(this.cu.sector, 1, 40);
        }
    }
    addPressureRay(stronk=false) {
        this._pressureRayCur = this._pressureRayCur ?? [0, 0, 0];
        this._pressureRayCurDelta = this._pressureRayCurDelta ?? [0, 0, 0];
        copyVecValue(this.ccp, this._pressureRayCur);
        multiplyVectorByScalarDest(getForwardVec(), ATMOSCALE, this._pressureRayCurDelta);

        let amount = .1;
        if (stronk) 
            amount = 100;
        this.addPressureAtLocation(this._pressureRayCur, amount);
        
        this._pressureRayCur[1] += ATMOSCALE * 1.5;

        for (let i = -3 * ATMOSCALE; i < 3 * ATMOSCALE; i++) {
            this._pressureRayCur[2] = i;
            this.addPressureAtLocation(this._pressureRayCur, amount);
        }
    }


    addPressureAtLocation(loc, amount) {
        this._au = this.indexAtmosphereUnit(loc);
        if (this._au != null) {
            this._au.pressure += amount;
            return true;
        }
        return false;
    }


    tick() {
        ahf++;

        this.ccp = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
        this.initAtmosphereUnits(); 
        this.cu = this.indexAtmosphereUnit(this.ccp);

        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].ahf = ahf;
        }

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
        for (let i = 0; i < this.i; i++) {
            let cur = this.tickAUList[i];
            cur.debugRender(this.ccp, this.dist);
        }

        // this.cu.debugRenderInit(this.ccp);
        // this.cu.debugRenderBounds();
    }

    getWindSpeedAtLocation(loc) {
        this._wslWsq = this.indexAtmosphereUnit(loc);
        if (this._wslWsq == null) {
            return [0, 0, 0];
        }
        return this._wslWsq.windSpeed;
    }
}
