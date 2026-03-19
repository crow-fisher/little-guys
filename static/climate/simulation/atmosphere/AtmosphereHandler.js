import { GBDD, GBDR, GBDU, GBSR, isButtonPressed } from "../../../gamepad.js";
import { gfc } from "../../../rendering/camera.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors } from "../../stars/matrix.js";
import { AtmosphereUnit } from "./model/AtmosphereUnit.js";


const I = Math.floor

export class AtmosphereHandler {
    constructor() {
        this.au = new Map(); // 3-D map to individuals sectors of XYZ space
        this.fullAUList = new Array(); // 1-D array array of all live AUs
        this.tickAUList = new Array();
        this.dist = 3;
    }

    initAtmosphereUnits() {
        this.ns = 12;
        this.x = I(this.ccp[0]);
        this.y = I(this.ccp[1]);
        this.z = I(this.ccp[2]);
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

        // this.cu.diffusionModel(this);
        // return;

        for (let i = 0; i < this.i; i++) {
            this.tickAUList[i].diffusionModel(this);
        }
    }

    gamepadInputTick() {
        if (isButtonPressed(GBDU)) {
            this.cu.pressure += 100;

        }

        if (isButtonPressed(GBDD)) {
            this.cu.pressure += 1000;
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

        this.debugRenderTick();
    }

    debugRenderTick() {
        let cur;
        for (let i = 0; i < this.i; i++) {
            cur = this.tickAUList[i];
            if (cur.cd < 30)
                cur.debugRender(this.ccp);
        }
    }
}
    