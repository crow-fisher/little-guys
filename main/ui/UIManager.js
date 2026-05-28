import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { UI_TOPBAR } from "./UIData.js";

export class UIManager {
    constructor(mainManager) {
        this.elements = new Array();
        this.mainManager = mainManager;
        this.addElement("topBarComponent", new TopBarComponent(this, UI_TOPBAR));
    }

    addElement(name, element) {
        this.elements.push(element);
        this[name] = element;
    } 

    update() {
        this.elements.forEach((window) => window.update());
    }

    render() {
        this.elements.forEach((window) => window.render());
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
    isFrameButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isFrameButtonPressed(b);
    }
    getCurDay() {
        return this.mainManager.worldManager.timeManager.curDay;
    }
    getCurTimeScale() {
        return this.mainManager.worldManager.timeManager.curTimeScale;
    }
    setCurTimeScale(val) {
        this.mainManager.worldManager.timeManager.curTimeScale = val;
    }
    
}
