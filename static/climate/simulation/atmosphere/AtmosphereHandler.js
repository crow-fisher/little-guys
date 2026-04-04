import { GBA, GBDU, isButtonPressed } from "../../../gamepad.js";
import { DEBUG } from "../../../index.js";
import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVectors, getVec3Length, subtractVectorsDest } from "../../stars/matrix.js";
import { ATMOSCALE, AtmosphereUnit } from "./model/AtmosphereUnit.js";


const F = Math.floor
const A = Math.abs

export class AtmosphereHandler {
    constructor() {
        this.au = new Map(); // 3-D map to individuals sectors of XYZ space
        this.fullAUList = new Array(); // 1-D array array of all live AUs
        this.tickAUList = new Array();
        this.dist = 8;
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

    indexAtmosphereUnit(sector) {
        return this.indexAtmosphereUnitDirectParams(
            Math.floor(sector[0] / ATMOSCALE), 
            Math.floor(sector[1] / ATMOSCALE), 
            Math.floor(sector[2] / ATMOSCALE)
        );
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
        if (isButtonPressed(GBA) || isButtonPressed(GBDU)) {
            this.addPressureAtLocation(this.cu.sector, 6, 40);
        }
    }

    addPressureAtLocation(loc, dist, amount) {
        let cdv = [0, 0, 0];
        for (let i = 0; i < this.i; i++) {
            subtractVectorsDest(loc, this.tickAUList[i].sector, cdv);
            addVectors(cdv, [0.5, 0.5, 0.5])
            let curDist = getVec3Length(cdv)
            if (curDist < dist) {
                this.tickAUList[i].pressure += amount / curDist;
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
        // for (let i = 0; i < this.i; i++) {
        //     let cur = this.tickAUList[i];
        //     cur.debugRender(this.ccp, this.dist - 5);
        // }

        this.cu.debugRenderInit(this.ccp);
        this.cu.debugRenderBounds();
    }

    getWindSpeedAtLocation(loc) {
        this._wslWsq = this.indexAtmosphereUnit(loc);
        if (this._wslWsq == null) {
            return [0, 0, 0];
        }
        return this._wslWsq.windSpeed;
    }
}
