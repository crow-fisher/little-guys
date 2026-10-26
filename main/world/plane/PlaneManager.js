import { RuntimeComponent } from "../../runtimeComponent.js";
import { Plane } from "./manipulation/model/Plane.js";

export class PlaneManager extends RuntimeComponent {
    constructor() {
        super();
        this.activePlane = new Plane(this);
    }
    di(mainManager) {
        super.di(mainManager);
        this.inputManager = this.mainManager.inputManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
        this.canvasManager = this.mainManager.canvasManager;
    }
    
    render() {
        this.activePlane.render();
    }
}