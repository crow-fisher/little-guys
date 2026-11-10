import { processRangeToOne } from "../../common.js";
import { RuntimeComponent } from "../../runtimeComponent.js";
import { clamp } from "../../util/func.js";
import { addVec4Mult, multiplyVectorByScalar } from "../../util/vector.js";
import { Square } from "./model/square/Square.js";
import { Plane } from "./model/Plane.js";
import { LiveSquare } from "./model/square/LiveSquare.js";
import { StaticSquare } from "./model/square/StaticSquare.js";
import { StaticLightManager } from "./model/lighting/StaticLightManager.js";
import { LiveLightManager } from "./model/lighting/LiveLightManager.js";

export class PlaneManager extends RuntimeComponent {
    constructor(blockManager) {
        super();
        this.blockManager = blockManager;
        this.staticPlanes = [];
        this.livePlanes = [];
        this.planes = [null, this.staticPlanes, this.livePlanes]
        this.lightingManagers = [null, this.staticLightManager, this.liveLightManager]
    }

    di(mainManager) {
        super.di(mainManager)
        this.uiManager = this.mainManager.uiManager;
        this.inputManager = this.mainManager.inputManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
        this.canvasManager = this.mainManager.canvasManager;
        this.cameraManager = this.mainManager.cameraManager;
    }

    postConstruct() {
        this.clickTime = 0;
        this.clickPoints = [];
        this.clickIdx = -1;
    }

    update() {
        this.mcc = this.uiManager.manipulationComponent.config();
        this.prepareBrushes();
        this.clickRoutine();
        this.staticPlanes.forEach((plane) => plane.update());
        this.livePlanes.forEach((plane) => plane.update());
}

    render() {
        this.staticPlanes.forEach((plane) => plane.render());
        this.livePlanes.forEach((plane) => plane.render());
    }

    clickRoutine() {
        if (this.mouseManager.isButtonPressed(0) || this.mouseManager.isButtonPressed(2)) {
            if (this.clickTime != this.mouseManager.time) {
                this.clickTime = this.mouseManager.time;
                this.clickIdx = 0;
            }
            this.clickPoints[this.clickIdx] = this.clickPoints[this.clickIdx] ?? structuredClone(this.mouseManager.offset);
            this.clickPoints[this.clickIdx].x = this.mouseManager.offset.x;
            this.clickPoints[this.clickIdx].y = this.mouseManager.offset.y;

            if (this.clickIdx > 1) {
                this.traceLineBetweenPoints(this.clickPoints[this.clickIdx - 1], this.clickPoints[this.clickIdx])
            }

            this.clickIdx++;
        }
    }

    activePlane() {
        if (this.mcc.plane.active == 0) {
            this.staticPlanes[this.mcc.plane.staticIdx] = this.staticPlanes[this.mcc.plane.staticIdx] ?? new Plane(this, new StaticLightManager(this));
            return this.staticPlanes[this.mcc.plane.staticIdx];
        }
        if (this.mcc.plane.active == 1) {
            this.livePlanes[this.mcc.plane.liveIdx] = this.livePlanes[this.mcc.plane.liveIdx] ?? new Plane(this, new LiveLightManager(this));
            return this.livePlanes[this.mcc.plane.liveIdx];
        }
    }

    brush(box) {
        if (this.mcc.plane.active == 0) {
            return this.staticBrush(box);
        }
        if (this.mcc.plane.active == 1) {
            return this.liveBrush(box);
        }
    }

    prepareBrushes() {
        this.prepareStaticBrush();
    }

    prepareStaticBrush() {
        this._sbColor = this.mcc.colorConfig.rgbaArr;
        this._sbColorNewSquare = structuredClone(this.mcc.colorConfig.rgbaArr);
        this._sbColorNewSquare[3] = 0;
    }

    staticBrush(box) {
        box.squares[this.mcc.plane.active] = box.squares[this.mcc.plane.active] ?? new StaticSquare(this.__sx, this.__sy, this._sbColorNewSquare);

        if (box.squares[this.mcc.plane.active] && this.mouseManager.isButtonPressed(2)) {
            box.squares[this.mcc.plane.active].renderColor[3] -= .01;
            if (box.squares[this.mcc.plane.active].renderColor[3] < 0) {
                box.squares[this.mcc.plane.active] = null;
                return;
            }
        }

        if (this.mouseManager.isButtonPressed(0)) {
            let fv = clamp((this._s ** 2) / this._d * processRangeToOne(this.mcc.brush.brushStrength * 100));
            multiplyVectorByScalar(box.squares[this.mcc.plane.active].renderColor, (1 - fv), 4);
            addVec4Mult(box.squares[this.mcc.plane.active].renderColor, this._sbColor, fv);
        }

        box.squares[this.mcc.plane.active].updateColor();
    }

    liveBrush(box) {
        box.squares[this.mcc.plane.active] = box.squares[this.mcc.plane.active] ?? new LiveSquare(this.__sx, this.__sy, this.mcc.live.materialConfig);
    }

    traceLineBetweenPoints(p1, p2) {
        let dx = (p2.x - p1.x)
        let dy = (p2.y - p1.y)

        let d = (dx ** 2 + dy ** 2) ** 0.5;
        let cx = p1.x, cy = p1.y;

        for (let i = 0; i < d; i++) {
            this.doBrushAtPoint(cx, cy);
            cx += (dx / d);
            cy += (dy / d);
        }
    }

    doBrushAtPoint(px, py) {
        this._s = this.mcc.brush.brushSize;

        let cx = this.cameraManager.windowWidthStart + (px / this.cameraManager.totalWidth) * this.cameraManager.windowWidth;
        let cy = this.cameraManager.windowHeightStart + (py / this.cameraManager.totalHeight) * this.cameraManager.windowHeight;

        for (let i = 0; i < this._s; i++) {
            for (let j = 0; j < this._s; j++) {
                this._d = (i - (this._s / 2)) ** 2 + (j - (this._s / 2)) ** 2;
                if (this._d > this._s)
                    continue;

                this._sx = cx + i - (this._s / 2);
                this._sy = cy + j - (this._s / 2);

                this.__sx = Math.floor(this._sx);
                this.__sy = Math.floor(this._sy);

                this.brush(this.activePlane().getBox(this.__sx, this.__sy, true));
            }
        }
    }

}