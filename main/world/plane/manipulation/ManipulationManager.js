import { getDist, processRangeToOne } from "../../../common.js";
import { RuntimeComponent } from "../../../runtimeComponent.js";
import { addVec3Mult, copyVecValue, getVec2Length, multiplyVectorByScalar } from "../../../util/vector.js";
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

    doBrushAtPoint(sx, sy, color) {
        let s = this.mcc.brush.brushSize;

        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                this._sx = sx + i - (s / 2);
                this._sy = sy + j - (s / 2);

                this.__sx = Math.floor(this._sx);
                this.__sy = Math.floor(this._sy);
                
                this._ab = this.activePlaneManager.activePlane.getBox(this.__sx, this.__sy);
                this._ab.sqStatic = this._ab.sqStatic ?? new Square(this.__sx, this.__sy, color);

                let d = (i - (s / 2)) ** 2 + (j - (s / 2)) ** 2;
                let fv = d / (s ** 2) * processRangeToOne(this.mcc.brush.brushStrength * 10);

                multiplyVectorByScalar(this._ab.sqStatic.renderColor, (1 - fv));
                addVec3Mult(this._ab.sqStatic.renderColor, color, fv);
            }
        }


    }

    traceLineBetweenPoints(pv, pd, color) {
        let d = (pd.x ** 2 + pd.y ** 2) ** 0.5;
        let cx = pv.x, cy = pv.y;

        let steps = Math.ceil(d);

        let dx = pd.x / steps;
        let dy = pd.y / steps;

        let px, py, ab;
        let sx, sy;
        let bs = 24;

        for (let i = 0; i < steps; i++) {
            px = cx - this.cameraManager.camera2ViewportCenter[0] - (bs / 2);
            py = cy - this.cameraManager.camera2ViewportCenter[1] - (bs / 2);

            sx = Math.floor(px);
            sy = Math.floor(py);

            this.doBrushAtPoint(sx, sy, color);

            cx += dx;
            cy += dy;

            if (pd.x > 0 && cx > pv.x + pd.x) {
                break;
            }
            if (pd.x < 0 && cx < pv.x + pd.x) {
                break;
            }
            if (pd.y > 0 && cy > pv.y + pd.y) {
                break;
            }
            if (pd.y < 0 && cy < pv.y + pd.y) {
                break;
            }
        }
    }

    render() {
    }

}