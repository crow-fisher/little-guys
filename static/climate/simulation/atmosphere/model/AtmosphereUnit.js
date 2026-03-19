import { COLOR_BLUE, COLOR_GREEN, COLOR_OTHER_BLUE, COLOR_RED, COLOR_WHITE } from "../../../../colors.js";
import { MAIN_CONTEXT } from "../../../../index.js";
import { debugRenderLineOffsetPoints } from "../../../../rendering/camera.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../../rendering/rasterizer.js";
import { loadEmptyScene } from "../../../../saveAndLoad.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_OFFSET } from "../../../../ui/UIData.js";
import { addVec3Dest, addVectors } from "../../../stars/matrix.js";

export class AtmosphereUnit {
    constructor(sector, size) { // vec3s
        this.sector = sector;
        this.size = size;
        this.pressure = 1;
        this.cd = -1; // camera dist. in sectors. euclidian distance.

        this.nt; // neighbor top
        this.nb; //      ... bottom
        this.nl; //      ... left 
        this.nr; //      ... right 
        this.nf; //      ... front
        this.nb; //      ... back
    }

    preTick(mgr) {
        this.initNeighbors(mgr);
        this.cd = (
            (this.sector[0] - mgr.ccp[0]) ** 2 + 
            (this.sector[1] - mgr.ccp[1]) ** 2 + 
            (this.sector[2] - mgr.ccp[2]) ** 2) ** 0.5;
    }

    initNeighbors(manager) {
        this.nt = this.nt ?? manager.getSectorOffset(this.sector, 0, -1, 0)
        this.nb = this.nb ?? manager.getSectorOffset(this.sector, 0, 1, 0)
        this.nl = this.nl ?? manager.getSectorOffset(this.sector, -1, 0, 0)
        this.nr = this.nr ?? manager.getSectorOffset(this.sector, 1, 0, 0)
        this.nf = this.nf ?? manager.getSectorOffset(this.sector, 0, 0, -1)
        this.nb = this.nb ?? manager.getSectorOffset(this.sector, 0, 0, 1)
    }

    bfsTraversal(mgr, dist, next, seen) {
        if (seen.has(this))
            return;

        this.cd = (
            (this.sector[0] - mgr.ccp[0]) ** 2 + 
            (this.sector[1] - mgr.ccp[1]) ** 2 + 
            (this.sector[2] - mgr.ccp[2]) ** 2) ** 0.5;

        seen.add(this);
        if (this.cd < dist) {
            next.push(this.nf); 
            next.push(this.nb); 
            next.push(this.nl); 
            next.push(this.nr); 
            next.push(this.nt); 
            next.push(this.nb); 
        }
    }

    addPressure(pressure, dist, seenSet) { 
        if (!seenSet.has(this)) { 
            seenSet.add(this);
            this.pressure += pressure;
            if (dist > 0) {
                this.nt?.addPressure(pressure * 0.9, dist - 1, seenSet);
                this.nb?.addPressure(pressure * 0.9, dist - 1, seenSet);
                this.nl?.addPressure(pressure * 0.9, dist - 1, seenSet);
                this.nr?.addPressure(pressure * 0.9, dist - 1, seenSet);
                this.nf?.addPressure(pressure * 0.9, dist - 1, seenSet);
                this.nb?.addPressure(pressure * 0.9, dist - 1, seenSet);
            }
        }
    }

    diffusionModel(mgr) {
        // hopefully 'mgr' is unused, but providing it in case it's needed
    }



    debugRender(ccp) {
        this.debugRenderInit(ccp);
        this.debugRenderBounds();
        // this.debugRenderLabel();
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
        this._tcs = new CoordinateSet(this.sector);
        this._tcs.process();
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
            debugRenderLineOffsetPoints(start, end, color); 
        });
    }

    debugRenderLabel() {
        addRenderJob(new PointLabelRenderJob(
            this._tcs.renderScreen[0],
            this._tcs.renderScreen[1],
            this._tcs.screen[2],
            2,
            COLOR_WHITE,
            "|" + this.cd,
            false));
    }
}