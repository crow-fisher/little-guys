import { RuntimeComponent } from "../runtimeComponent.js";
import { ManipulationManager } from "./plane/manipulation/ManipulationManager.js";
import { StaticPlaneManager } from "./plane/StaticPlaneManager.js";
import { StarManager } from "./stars/starManager.js";

export class WorldManager extends RuntimeComponent {
    constructor() {
        super();
        this.starManager = new StarManager(this);
        this.staticPlaneManager = new StaticPlaneManager(this);
        this.manipulationManager = new ManipulationManager(this);
    }

    di(mainManager) {
        super.di(mainManager);
        this.starManager.di(mainManager);
    }
    postConstruct() {
        this.starManager.postConstruct();
    }

    update() {
        this.starManager.update();
    }
    render() {
        this.starManager.render();
    }
    getContext() {
        return this.mainManager.canvasManager.context;
    }
    getCanvasWidth() {
        return this.mainManager.canvasManager.canvas.width;
    }
    getCanvasHeight() {
        return this.mainManager.canvasManager.canvas.height;
    }
    getForward() {
        return this.mainManager.cameraManager.forward;
    }
    getWorldToCamera() {
        return this.mainManager.cameraManager.worldToCamera;
    }
    getCameraManager() {
        return this.mainManager.cameraManager;
    }
}