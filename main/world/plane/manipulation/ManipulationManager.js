import { getDist, invlerp, processRangeToOne } from "../../../common.js";
import { RuntimeComponent } from "../../../runtimeComponent.js";
import { clamp } from "../../../util/func.js";
import { addVec3Mult, addVec4Mult, copyVecValue, getVec2Length, multiplyVectorByScalar } from "../../../util/vector.js";
import { Square } from "./model/square/Square.js";

export class ManipulationManager extends RuntimeComponent {
    constructor(blockManager) {
        super();
        this.blockManager = blockManager;
        this.activePlaneManager = null;
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
        if (this.activePlaneManager == null) {
            return;
        }

        this.mcc = this.uiManager.manipulationComponent.config();

        if (this.mouseManager.isButtonPressed(0) || this.mouseManager.isButtonPressed(2)) {
            if (this.clickTime != this.mouseManager.time) {
                this.clickTime = this.mouseManager.time;
                this.clickIdx = 0;
            }
            this.clickPoints[this.clickIdx] = this.clickPoints[this.clickIdx] ?? structuredClone(this.mouseManager.offset);
            this.clickPoints[this.clickIdx].x = this.mouseManager.offset.x;
            this.clickPoints[this.clickIdx].y = this.mouseManager.offset.y;
            
            if (this.clickIdx > 1) {
                this.traceLineBetweenPoints(this.clickPoints[this.clickIdx - 1], this.clickPoints[this.clickIdx], this.mcc.colorConfig.rgbaArr)
            }

            this.clickIdx++;
        }
        

    }

    doBrushAtPoint(px, py, color) {
        // 'px' and 'py' here refer to canvas pixel locations
        let s = this.mcc.brush.brushSize;

        let cx = this.cameraManager.windowWidthStart + (px / this.cameraManager.totalWidth) * this.cameraManager.windowWidth;
        let cy = this.cameraManager.windowHeightStart + (py / this.cameraManager.totalHeight) * this.cameraManager.windowHeight;

        let colorNewSquare = structuredClone(color);
        colorNewSquare[3] = 0;

        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                let d = (i - (s / 2)) ** 2 + (j - (s / 2)) ** 2;
                if (d > s)
                    continue;

                this._sx = cx + i - (s / 2);
                this._sy = cy + j - (s / 2);

                this.__sx = Math.floor(this._sx);
                this.__sy = Math.floor(this._sy);
                
                this._ab = this.activePlaneManager.activePlane.getBox(this.__sx, this.__sy);

                this._ab.sqStatic = this._ab.sqStatic ?? new Square(this.__sx, this.__sy, colorNewSquare);

                if (this._ab.sqStatic && this.mouseManager.isButtonPressed(2)) {
                    this._ab.sqStatic.renderColor[3] -= .01; 
                    if (this._ab.sqStatic.renderColor[3] < 0) {
                        this._ab.sqStatic = null;
                        continue;
                    }
                }

                let fv = clamp((s ** 2) / d * processRangeToOne(this.mcc.brush.brushStrength * 100));
                multiplyVectorByScalar(this._ab.sqStatic.renderColor, (1 - fv), 4);
                addVec4Mult(this._ab.sqStatic.renderColor, color, fv);
            }
        }


    }

    traceLineBetweenPoints(p1, p2, color) {
        let dx = (p2.x - p1.x)
        let dy = (p2.y - p1.y)

        let d = (dx ** 2 + dy ** 2) ** 0.5;
        let cx = p1.x, cy = p1.y;

        

        for (let i = 0; i < d; i++) {
            this.doBrushAtPoint(cx, cy, color);
            cx += (dx / d);
            cy += (dy / d);
        }
    }

    render() {
    }

}