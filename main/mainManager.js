import { CanvasManager } from "./rendering/canvasManager.js"
import { UIManager } from "./ui/UIManager.js";

export class MainManager {
    constructor() {
        this.canvasManager = new CanvasManager("main");
        this.uiManager = new UIManager(this);
        this.canvasManager.addCallbacks(this);
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
    }

    render() {
        this.canvasManager.render();
        this.uiManager.render();
    }

    // Canvas Callbacks
    mousemove() { }
    mousedown() { }
    mouseup() { }

    touchstart() { }
    touchend() { }
    touchmove() { }

    onkeydown() { }
    onkeyup() { }
    onwheel() { }

    // Canvas Event Listeners
    mousemove(e) { }
    mousedown(e) { }
    mouseup(e) { }

    drop(e) { }

    // Window Callbacks
    onresize() { this.canvasManager.resize() }
    oncontextmenu() { return false ;}


}