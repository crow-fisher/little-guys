import { GBDD, GBDR, GBDU, GBSR, isButtonPressed } from "../../../gamepad.js";
import { gfc } from "../../../rendering/camera.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors } from "../../stars/matrix.js";
import { AtmosphereUnit } from "./model/AtmosphereUnit.js";


const I = Math.floor

export class AtmosphereHandler {
    constructor() {
        this.au = null; // 3-D map to individuals sectors of XYZ space
        this.atmosphereUnitList = null; // 1-D array array of the same. For easy traversal

    }

    initAtmosphereUnits() {
        this.atmosphereUnitList = new Array();
        this.au = new Map();
        this.ns = 3;
        this.x = I(this.ccp[0]);
        this.y = I(this.ccp[1]);
        this.z = I(this.ccp[2]);
        this.xm;
        this.ym;
        this.zm;
        this.cau;

        for (let i = -this.ns; i < this.ns; i++) {
            this.au.set(this.x + i, this.au.get(this.x + i) ?? new Map());
            this.xm = this.au.get(this.x + i);
            for (let j = -this.ns; j < this.ns; j++) {
                this.xm.set(this.y + j, this.xm.get(this.y + j) ?? new Map());
                this.ym = this.xm.get(this.y + j);
                for (let k = -this.ns; k < this.ns; k++) {
                    this.cau = new AtmosphereUnit([this.x + i, this.y + j, this.z + k]);
                    this.atmosphereUnitList.push(this.cau);
                    this.ym.set(this.z + k, new AtmosphereUnit([this.x + i, this.y + j, this.z + k]));
                }
            }
        }
        this.atmosphereUnitList.forEach((au) => au.initNeighbors(this));
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
    }

    gamepadInputTick() {
        if (isButtonPressed(GBDU)) {
            this.cu.addPressure(0.1, 3, new Set());
        }

        if (isButtonPressed(GBDD)) {
            this.cu.addPressure(-0.1, 3, new Set());

        }
    }

    tick() { 
        this.ccp = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
        if (this.au == null) {
            this.initAtmosphereUnits();
        }
        this.cu = this.indexAtmosphereUnit(this.ccp);
        if (this.cu != null) {
            this.gamepadInputTick();
            this.diffusionModelTick();
        }
        this.indexAtmosphereUnit([-1, -1, -1])?.addPressure(.1, 1, new Set());
        this.debugRenderTick();
    }

    debugRenderTick() {
        this.indexAtmosphereUnit([-1, -1, -1]).debugRender(this.ccp);

        this.atmosphereUnitList.forEach((au) => {
            // if (au.sector[0] % 16 == 0 &&  au.sector[1] % 16 == 0 && au.sector[2] % 16 == 0) {
                au.debugRender(this.ccp)
            // }
        });
    }
}
    