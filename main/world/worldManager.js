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
        this.staticPlaneManager.di(mainManager);
        this.manipulationManager.di(mainManager);
        
        this.uiManager = this.mainManager.uiManager;
        this.manipulationComponent = this.uiManager.manipulationComponent;
    }
    postConstruct() {
        this.starManager.postConstruct();
    }

    update() {
        // this.starManager.update();
        if (this.manipulationComponent.gcoDefault().active) {
            this.manipulationManager.activePlaneManager = this.staticPlaneManager;
            this.manipulationManager.update();
        }
        
    }
    render() {
        // this.starManager.render();
        this.staticPlaneManager.render();
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