import { getDist } from "../../../common.js";
import { RuntimeComponent } from "../../../runtimeComponent.js";
import { getVec2Length } from "../../../util/vector.js";
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
            this.traceLineBetweenPoints(this.mouseManager.offset, this.mouseManager.doffset, mcc.brush.blockSize, mcc.colorConfig.rgbArr)
        }

    }

    traceLineBetweenPoints(pv, pd, blockSize, color) {
        let d = (pd.x ** 2 + pd.y ** 2) ** 0.5;
        
        let dx = pd.x / blockSize;
        let dy = pd.y / blockSize;

        let cx = pv.x, cy = pv.y;
        
        do {
            this.activePlaneManager.activePlane.addSquare(new Square(blockSize, color),
                cx - this.activePlaneManager.activePlane.offsetX, 
                cy - this.activePlaneManager.activePlane.offsetY);
            cx += dx;
            cy += dy;
            if (Math.random() > 0.9) 
                break;
        }
        while ((pv.x - cx) ** 2 + (pv.y - cy) ** 2 > blockSize);
    }

    render() {
    }

}