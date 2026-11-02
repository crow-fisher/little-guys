import { RuntimeComponent } from "../../runtimeComponent.js";
import { Plane } from "./manipulation/model/Plane.js";

export class PlaneManager extends RuntimeComponent {
    constructor() {
        super();
        this.plane = new Plane();
    }
    di(mainManager) {
        super.di(mainManager);
        this.inputManager = this.mainManager.inputManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
        this.canvasManager = this.mainManager.canvasManager;
        this.cameraManager = this.mainManager.cameraManager;
    }

}