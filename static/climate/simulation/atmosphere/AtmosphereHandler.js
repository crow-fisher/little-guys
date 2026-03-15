import { gfc } from "../../../rendering/camera.js";
import { loadGD, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { AtmosphereUnit } from "./model/AtmosphereUnit.js";


const I = Math.floor

export class AtmosphereHandler {
    constructor() {
        this.au = null; // 3-D array
    }

    initAtmosphereUnits() {
        this.atmosphereUnitList = new Array();
        this.au = new Map();
        this.ns = 10;
        this.x = I(this.ccp[0]);
        this.y = I(this.ccp[1]);
        this.z = I(this.ccp[2]);
        this.xm;
        this.ym;
        this.zm;
        this.cau;
        for (let i = 0; i < this.ns; i++) {
            this.au.set(this.x + i, this.au.get(this.x + i) ?? new Map());
            this.xm = this.au.get(this.x + i);
            for (let j = 0; j < this.ns; j++) {
                this.xm.set(this.y + j, this.xm.get(this.y + j) ?? new Map());
                this.ym = this.xm.get(this.y + j);
                for (let k = 0; k < this.ns; k++) {
                    this.cau = new AtmosphereUnit([this.x + i, this.y + j, this.z + k]);
                    this.atmosphereUnitList.push(this.cau);
                    this.ym.set(this.z + k, new AtmosphereUnit([this.x + i, this.y + j, this.z + k]));
                }
            }
        }

    }

    tick() {
        this.ccp = loadGD(UI_CAMERA_OFFSET_VEC);
        if (this.au == null) {
            this.initAtmosphereUnits();
        }

    }
}