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
        
        this.dist = 3;
        this.nearAUList = new Array(); // 1-D array of AUs within `this.dist` of the camera

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
                }
            }
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
    }

    gamepadInputTick() {
        if (isButtonPressed(GBDU)) {
            this.cu.addPressure(0.1, 3, new Set());
        }

        if (isButtonPressed(GBDD)) {
            this.cu.addPressure(-0.1, 3, new Set());

        }
    }

    bfsTraversalRoutine() {
        this.dist = 12; // some UI param for simulation distance. hahaha future devin problem. fuck you. i typed that for you jackass
        
        this._seenSet = this._seenSet ?? new Set();
        this._seenSet.clear()
         
        this._pendingNext = this._pendingNext ?? new Array();
        this._pendingNext.length = 0;

        this._next = this._next ?? new Array();
        this._next.length = 0;

        this.cu.bfsTraversal(this.dist, this._pendingNext, this._seenSet);
        for (let i = 0; i < this._pendingNext.length; i++) {
            if (this._pendingNext.at(i)[0] != null) {
                this._next.push(this._pendingNext.at(i));
            }
        }
        this._pendingNext.length = 0;

        let arr;
        while (this._next.length > 0) {
            arr = this._next.shift();

            arr[0].bfsTraversal(arr[1], this._pendingNext, this._seenSet);
            for (let i = 0; i < this._pendingNext.length; i++) {
                if (this._pendingNext.at(i)[0] != null) {
                    this._next.push(this._pendingNext.at(i));
                }
            }
            this._pendingNext.length = 0;
        }
    }

    localityTick() {
        this.bfsTraversalRoutine();
        
    }

    tick() { 
        this.ccp = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
        this.initAtmosphereUnits();
        this.cu = this.indexAtmosphereUnit(this.ccp);
        this.fullAUList.forEach((au) => au.pretick(this));

        this.localityTick();


        if (this.cu != null) {
            this.gamepadInputTick();
            this.diffusionModelTick();
        }
        this.indexAtmosphereUnit([-1, -1, -1])?.addPressure(.1, 1, new Set());
        this.debugRenderTick();
    }

    debugRenderTick() {
        this.cu.debugRender(this.ccp);

        this.fullAUList.forEach((au) => {
            // if (au.sector[0] % 16 == 0 &&  au.sector[1] % 16 == 0 && au.sector[2] % 16 == 0) {

            if (au.cd == 0)
                au.debugRender(this.ccp)
            // }
        });
    }
}
    