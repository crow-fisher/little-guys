import { COLOR_BLUE, COLOR_GREEN, COLOR_OTHER_BLUE, COLOR_RED, COLOR_WHITE } from "../../../../colors.js";
import { MAIN_CONTEXT } from "../../../../index.js";
import { debugRenderLineOffsetPoints } from "../../../../rendering/camera.js";
import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";
import { PointLabelRenderJob } from "../../../../rendering/model/PointLabelRenderJob.js";
import { addRenderJob } from "../../../../rendering/rasterizer.js";
import { addVectors } from "../../../stars/matrix.js";

export class AtmosphereUnit {
    constructor(sector, size) { // vec3s
        this.sector = sector;
        this.size = size;
        this.pressure = 1;

        this.nt; // neighbor top
        this.nb; // ... bottom
        this.nl; // ... left 
        this.nr; // ... right 
        this.nf; // ... front
        this.nb; // ... back
    }

    initNeighbors(manager) {
        this.nt = manager.getSectorOffset(this.sector, 0, -1, 0)
        this.nb = manager.getSectorOffset(this.sector, 0, 1, 0)
        this.nl = manager.getSectorOffset(this.sector, -1, 0, 0)
        this.nr = manager.getSectorOffset(this.sector, 1, 0, 0)
        this.nf = manager.getSectorOffset(this.sector, 0, 0, -1)
        this.nb = manager.getSectorOffset(this.sector, 0, 0, 1)
    }

    diffusionTick(dist, seenSet) {

    }

    addPressure(pressure, dist, seenSet) { 
        if (!seenSet.has(this)) { 
            seenSet.add(this);
            this.pressure += pressure;
            console.log(this.sector, this.pressure, pressure)
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

    debugRender(ccp) {
        this.debugRenderInit(ccp);
        this.debugRenderBounds();
        this.debugRenderLabel();
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

        this._center = [(this._x1 + this._x2) / 1, (this._y1 + this._y2) / 1, (this._z1 + this._z2) / 1]
        this._tcs = new CoordinateSet(this._center);
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
            4,
            COLOR_WHITE,
            this.pressure.toFixed(2),
            false));
    }
}