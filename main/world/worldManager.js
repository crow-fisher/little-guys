import { StarManager } from "./stars/starManager.js";
import { TimeManager } from "./time/timeManager.js";

export class WorldManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.timeManager = new TimeManager(this);
        this.starManager = new StarManager(this);
    }
    update() {
        this.timeManager.update();
    }
    render() {
        this.timeManager.render();
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
}