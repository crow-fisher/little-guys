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
        return this.mainManager.mouseManager.ms;
    }
    frameButtonPressed(b) {
        return this.mainManager.mouseManager.frameButtonPressed(b);
    }
    
}
