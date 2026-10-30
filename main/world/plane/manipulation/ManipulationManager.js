import { getDist, invlerp, processRangeToOne } from "../../../common.js";
import { RuntimeComponent } from "../../../runtimeComponent.js";
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
    }

    update() {
        if (this.activePlaneManager == null) {
            return;
        }

        this.ap = this.activePlaneManager.activePlane;
        this.mdo = this.mouseManager.doffset;
        this.mcc = this.uiManager.manipulationComponent.config();

        if (this.mouseManager.isButtonPressed(1)) {
            this.ap.offsetX += this.mdo.x;
            this.ap.offsetY += this.mdo.y;
        }

        if (this.mouseManager.isButtonPressed(0)) {
            this.traceLineBetweenPoints(this.mouseManager.offset, this.mouseManager.doffset, this.mcc.colorConfig.rgbaArr)
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
                this._sx = cx + i - (s / 2);
                this._sy = cy + j - (s / 2);

                this.__sx = Math.floor(this._sx);
                this.__sy = Math.floor(this._sy);
                
                this._ab = this.activePlaneManager.activePlane.getBox(this.__sx, this.__sy);
                this._ab.sqStatic = this._ab.sqStatic ?? new Square(this.__sx, this.__sy, colorNewSquare);

                let d = (i - (s / 2)) ** 2 + (j - (s / 2)) ** 2;
                let fv = (s ** 2) / d * processRangeToOne(this.mcc.brush.brushStrength * 10);

                multiplyVectorByScalar(this._ab.sqStatic.renderColor, (1 - fv), 4);
                addVec4Mult(this._ab.sqStatic.renderColor, color, fv);
            }
        }


    }

    traceLineBetweenPoints(pv, pd, color) {
        let d = (pd.x ** 2 + pd.y ** 2) ** 0.5;
        let cx = pv.x, cy = pv.y;

        let dx = pd.x / d;
        let dy = pd.y / d;

        for (let i = 0; i < d; i++) {
            this.doBrushAtPoint(cx, cy, color);
            cx += dx;
            cy += dy;
        }
    }

    render() {
    }

}