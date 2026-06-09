import { loadGD, UI_CAMERA_OFFSET_VEC } from "../ui/UIData.js";
import { BlockManager } from "./block/BlockManager.js";
import { StarManager } from "./stars/starManager.js";
import { TimeManager } from "./time/timeManager.js";

export class WorldManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        
        this.timeManager = new TimeManager(this);
        this.starManager = new StarManager(this);
        this.blockManager = new BlockManager(this);
        
    }
    update() {
        this.timeManager.update();
        this.blockManager.update();
    }
    render() {
        this.timeManager.render();
        this.starManager.render();
        this.blockManager.render();

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