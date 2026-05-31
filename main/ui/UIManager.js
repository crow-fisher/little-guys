import { hsvToHex } from "../color/color.js";
import { AstronomyAtlasComponent } from "./components/AstronomyAtlas/AstronomyAtlasComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { loadGD, saveGD, UI_COMPONENT_DATA, UI_TOPBAR } from "./UIData.js";

export class UIManager {
    constructor(mainManager) {
        this.mainManager = mainManager;

        this.config = loadGD(UI_COMPONENT_DATA);

        this.astronomyAtlasComponent = new AstronomyAtlasComponent(this);

        this.components = [
            this.astronomyAtlasComponent
        ]
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
