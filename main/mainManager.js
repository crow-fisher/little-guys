import { MouseManager } from "./input/source/MouseManager.js";
import { CameraManager } from "./rendering/cameraManager.js";
import { CanvasManager } from "./rendering/canvasManager.js"
import { UIManager } from "./ui/UIManager.js";
import { WorldManager } from "./world/worldManager.js";

export class MainManager {
    constructor() {
        this.canvasManager = new CanvasManager(this);
        this.cameraManager = new CameraManager(this);
        this.mouseManager = new MouseManager(this);
        this.uiManager = new UIManager(this);
        this.worldManager = new WorldManager(this);
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
        this.mouseManager.update();
    }

    render() {
        this.canvasManager.render();
        this.cameraManager.render();
        this.mouseManager.render();
        this.uiManager.render();
    }

    // Canvas Callbacks
    touchstart() { }
    touchend() { }
    touchmove() { }

    onkeydown() { }
    onkeyup() { }
    onwheel() { }

    // Canvas Event Listeners
    mousemove(e) { this.mouseManager.mousemove(e)}
    mousedown(e) { this.mouseManager.mousedown(e)}
    mouseup(e) { this.mouseManager.mouseup(e)}

    drop(e) { }

    // Window Callbacks
    onresize() { this.canvasManager.resize() }
    oncontextmenu() { return false ;}


}