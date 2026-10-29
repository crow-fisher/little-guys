import { getDist } from "../../../common.js";
import { RuntimeComponent } from "../../../runtimeComponent.js";
import { copyVecValue, getVec2Length } from "../../../util/vector.js";
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
    }

    postConstruct() {
    }

    update() {
        if (this.activePlaneManager == null) {
            return;
        }

        let ap = this.activePlaneManager.activePlane;
        let mo = this.mouseManager.offset;
        let mdo = this.mouseManager.doffset;
        let mcc = this.uiManager.manipulationComponent.config();

        if (this.mouseManager.isButtonPressed(1)) {
            ap.offsetX += mdo.x;
            ap.offsetY += mdo.y;
        }

        if (this.mouseManager.isButtonPressed(0)) {
            this.traceLineBetweenPoints(this.mouseManager.offset, this.mouseManager.doffset, mcc.brush.blockSize, mcc.colorConfig.rgbaArr)
        }

    }

    traceLineBetweenPoints(pv, pd, blockSize, color) {
        let d = (pd.x ** 2 + pd.y ** 2) ** 0.5;
        let f = blockSize / 2;
        let cx = pv.x, cy = pv.y;

        let steps = Math.ceil(d / f);

        let dx = pd.x / steps;
        let dy = pd.y / steps;

        let px, py, ab;
        let sx, sy;
        let bs = 24;

        for (let i = 0; i < steps; i++) {
            px = cx - this.activePlaneManager.activePlane.offsetX - (bs / 2);
            py = cy - this.activePlaneManager.activePlane.offsetY - (bs / 2);

            sx = px - px % bs;
            sy = py - py % bs;

            ab = this.activePlaneManager.activePlane.getBox(sx, sy);
            ab.sqStatic = ab.sqStatic ?? new Square(bs, sx, sy, color);
            copyVecValue(color, ab.sqStatic.renderColor);

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