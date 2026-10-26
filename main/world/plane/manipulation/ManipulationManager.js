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

        let ap = this.activePlaneManager.activePlane;
        let mo = this.mouseManager.offset;
        let mdo = this.mouseManager.doffset;

        if (this.mouseManager.isButtonPressed(1)) {
            ap.offsetX += mdo.x;
            ap.offsetY += mdo.y;
        }

        if (this.mouseManager.isButtonPressed(0)) {
        this.activePlaneManager.activePlane.addSquare(new Square(), mo.x - ap.offsetX, mo.y - ap.offsetY);
        }

    }

    render() {
    }

}