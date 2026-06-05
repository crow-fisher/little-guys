import { loadGD, UI_CAMERA_OFFSET_VEC } from "../ui/UIData.js";
import { PlaneManager } from "./plane/PlaneManager.js";
import { StarManager } from "./stars/starManager.js";
import { TimeManager } from "./time/timeManager.js";

export class WorldManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.timeManager = new TimeManager(this);
        this.starManager = new StarManager(this);
        this.planeManager = new PlaneManager(this);
    }
    update() {
        this.timeManager.update();
        this.planeManager.update();
    }
    render() {
        this.timeManager.render();
        this.starManager.render();
        this.planeManager.render();
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
    getCameraToWorld() {
        return this.mainManager.cameraManager.cameraToWorld;
    }
    getWorldToCamera() {
        return this.mainManager.cameraManager.worldToCamera;
    }
    getCameraOffset() {
        return loadGD(UI_CAMERA_OFFSET_VEC);
    }
    getCameraManager() {
        return this.mainManager.cameraManager;
    }
}