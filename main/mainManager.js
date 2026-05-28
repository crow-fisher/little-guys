import { InputManager } from "./input/InputManager.js";
import { MouseManager } from "./input/source/MouseManager.js";
import { CameraManager } from "./rendering/cameraManager.js";
import { CanvasManager } from "./rendering/canvasManager.js"
import { UIManager } from "./ui/UIManager.js";
import { TimeManager } from "./world/time/timeManager.js";
import { WorldManager } from "./world/worldManager.js";

export class MainManager {
    constructor() {
        this.canvasManager = new CanvasManager(this);
        this.cameraManager = new CameraManager(this);
        this.uiManager = new UIManager(this);
        this.worldManager = new WorldManager(this);
        this.inputManager = new InputManager(this);
        this.timeManager = new TimeManager(this);
    }

    main() {
        this.frame();
        setTimeout(() => this.main(), 0)
    }

    frame() {
        this.update();
        this.render();
    }

    update() {
        this.uiManager.update();
        this.cameraManager.update();
        this.inputManager.update();
        this.timeManager.update();
    }

    render() {
        this.canvasManager.render();
        this.timeManager.render();
        this.cameraManager.render();
        this.inputManager.render();
        this.uiManager.render();
    }

    getCurDay() {
        return this.timeManager.curDay;
    }
    
    setCurDay(curDay) {
        this.timeManager.curDay = curDay;
    }

    seekCurDay(curDay) {
        this.timeManager.seekCurDay(curDay);
    }

    // Canvas Callbacks
    touchstart() { }
    touchend() { }
    touchmove() { }

    onkeydown(e) { this.inputManager.onkeydown(e) }
    onkeyup(e) { this.inputManager.onkeyup(e) }
    onwheel(e) { this.inputManager.onwheel(e) }

    // Canvas Event Listeners
    mousemove(e) { this.inputManager.mousemove(e) }
    mousedown(e) { this.inputManager.mousedown(e) }
    mouseup(e) { this.inputManager.mouseup(e) }

    drop(e) { }

    // Window Callbacks
    onresize() { this.canvasManager.resize() }
    oncontextmenu() { return false; }

}