import { TimeManager } from "./time/timeManager.js";

export class WorldManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.timeManager = new TimeManager(this);
    }
    update() {
        this.timeManager.update();
    }
    render() {
        this.timeManager.render();
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