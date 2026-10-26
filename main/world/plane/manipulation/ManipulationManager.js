import { RuntimeComponent } from "../../../runtimeComponent.js";
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

        if (!this.mouseManager.isButtonPressed(0)) {
            return;
        }

        let ap = this.activePlaneManager.activePlane;
        let mo = this.mouseManager.offset;

        let px = Math.floor((mo.x - ap.offsetX) / ap.blockSize);
        let py = Math.floor((mo.y - ap.offsetY) / ap.blockSize);

        this.activePlaneManager.activePlane.addSquare(new Square(), px, py);
    }

    render() {
    }

}