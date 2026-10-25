import { RuntimeComponent } from "../runtimeComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";

export class UIManager extends RuntimeComponent {
    constructor() {
        super();

        this._config = {} // accessed via '.config()' method within Component.js
        this.topbarConfig = {}  // accessed directly

        this.topBarComponent = new TopBarComponent(this);
        this.components = [this.topBarComponent];

        this.subtreeElements = [
        ]
    }

    requestTouch() {
        if (!this.frameLastTouched) {
            this.frameLastTouched = true;
            return true;
        } else {
            return false;
        }
    }

    update() {
        this.frameLastTouched = false;
        this.components.sort((b, a) => (a.lastTouched ?? 0) - (b.lastTouched ?? 0))
        this.components.filter((c) => c.activeFunc()).forEach((component) => component.update());
    }

    render() {
        this.components.sort((a, b) => (a.lastTouched ?? 0) - (b.lastTouched ?? 0))
        this.components.filter((c) => c.activeFunc()).forEach((component) => component.render());
    }

    getBaseUISize() {
        return 8;
    }

    getContext() {
        if (this.mainManager.canvasManager.context)
            return this.mainManager.canvasManager.context;
    }
    getWidth() {
        return this.mainManager.canvasManager.canvas.width;
    }
    getHeight() {
        return this.mainManager.canvasManager.canvas.height;
    }
    mousePosition() {
        return this.mainManager.inputManager.mouseManager.offset;
    }
    mouseDOffset() {
        return this.mainManager.inputManager.mouseManager.doffset;
    }
    isFrameButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isFrameButtonPressed(b);
    }
    isButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isButtonPressed(b);
    }
    isAnyMouseButtonPressed() {
        return this.mainManager.inputManager.mouseManager.ms != 0;
    }
    getCurDay() {
        return this.mainManager.timeManager.curDay;
    }
    getCurTimeScale() {
        return 1; //
        return this.mainManager.timeManager.curTimeScale;
    }
    setCurTimeScale(val) {
        this.mainManager.timeManager.curTimeScale = val;
    }
}
