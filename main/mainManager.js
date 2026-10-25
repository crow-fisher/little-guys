import { DebugOptions } from "./debugOptions.js";
import { InputManager } from "./input/inputManager.js";
import { MouseManager } from "./input/source/mouseManager.js";
import { CameraManager } from "./rendering/cameraManager.js";
import { CanvasManager } from "./rendering/canvasManager.js"
import { RasterizationManager } from "./rendering/rasterizationManager.js";
import { RuntimeComponent } from "./runtimeComponent.js";
import { UIManager } from "./ui/UIManager.js";
import { TimeManager } from "./world/time/timeManager.js";
import { WorldManager } from "./world/worldManager.js";

export class MainManager {
    constructor() {
        this.debugOptions = new DebugOptions();
        this.canvasManager = new CanvasManager();
        this.cameraManager = new CameraManager();
        this.rasterizationManager = new RasterizationManager();
        this.inputManager = new InputManager();
        this.uiManager = new UIManager();
        this.timeManager = new TimeManager();
        this.worldManager = new WorldManager();

    }
    di() {
        this.canvasManager.di(this);
        this.cameraManager.di(this);
        this.rasterizationManager.di(this);
        this.inputManager.di(this);
        this.uiManager.di(this);
        this.timeManager.di(this);
        this.worldManager.di(this);
    }

    postConstruct() {
        this.canvasManager.postConstruct();
        this.cameraManager.postConstruct();
        this.rasterizationManager.postConstruct();
        this.inputManager.postConstruct();
        this.uiManager.postConstruct();
        this.worldManager.postConstruct();

    }

    main() {
        this.di();
        this.postConstruct();
        this.frameRuntime();
    }

    frameRuntime() {
        this.frame();
        setTimeout(() => this.frameRuntime(), 0);
    }

    frame() {
        this.update();
        this.render();
    }

    update() {
        this.uiManager.update();
        this.cameraManager.update();

        this.rasterizationManager.update();
        this.inputManager.update();

    }

    render() {
        this.canvasManager.render();
        this.rasterizationManager.render();

        // this.cameraManager.render();
        // this.inputManager.render();
        
        this.uiManager.render();
        this.worldManager.render();
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