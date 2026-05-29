import { hsvToHex } from "../color/color.js";
import { AstronomyAtlasComponent } from "./components/AstronomyAtlas/AstronomyAtlasComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { loadGD, saveGD, UI_COMPONENT_DATA, UI_TOPBAR } from "./UIData.js";

export class UIManager {
    constructor(mainManager) {
        this.components = new Array();
        this.mainManager = mainManager;
        this.addComponent(AstronomyAtlasComponent, this.astronomyAtlasDefault)
        // this.addElement("topBarComponent", new TopBarComponent(this, UI_TOPBAR));
        this.addElement("astronomyAtlasComponent", new AstronomyAtlasComponent(this, UI_TOPBAR));
    }

    addComponent(componentRef, defaultInit) {
        let component = new componentRef(this);
        if (loadGD(UI_COMPONENT_DATA)[component.name] == null) {
            loadGD(UI_COMPONENT_DATA)[component.name] = defaultInit();
        }
        this.components.push(component);
    }

    astronomyAtlasInit() {}
    astronomyAtlasDefault() {
        return {
            offsetScale: [100, 100, 600, 600]
        }
    }

    getDataKey(name, key) {
        return loadGD(UI_COMPONENT_DATA)[name][key]
    }

    /*
    "base" colors 
        
        "hsl(36, 81%, 37%)" active
        "hsl(41, 29%, 29%)" inactive

    */

    getColorActive(b=1) {
        return hsvToHex(36, .81, .37 * b);
    }

    getColorInactive(b=1) {
        return hsvToHex(41, .29, .29 * b);
    }

    getColorInactiveDark() {
        return this.getColorInactive(0.5);
    }

    addElement(name, element) {
        this.components.push(element);
        this[name] = element;
    }

    update() {
        this.components.forEach((window) => window.update());
    }

    render() {
        this.components.forEach((window) => window.render());
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
