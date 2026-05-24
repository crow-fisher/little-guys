import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { UI_TOPBAR } from "./UIData.js";

export class UIManager {
    constructor(mainManager) {
        this.elements = new Array();
        this.mainManager = mainManager;
        this.addElement("topBarComponent", new TopBarComponent(UI_TOPBAR, this, mainManager));
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

    getWidth() {
        return this.mainManager.canvasManager.width;
    }
    getHeight() {
        return this.mainManager.canvasManager.width;
    }
}
