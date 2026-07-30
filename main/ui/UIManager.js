import { hsvToHex } from "../color/color.js";
import { hsv2rgb } from "../common.js";
import { multiplyVectorByScalar } from "../util/vector.js";
import { AstronomyAtlasComponent } from "./components/AstronomyAtlas/AstronomyAtlasComponent.js";
import { BlockManagerComponent } from "./components/BlockManager/BlockManagerComponent.js";
import { ColorPickerComponent } from "./components/ColorPickerComponent.js";
import { PlaneManagerComponent } from "./components/PlaneManager/PlaneManagerComponent.js";
import { ToolBarComponent } from "./toolbar/ToolBarComponent.js";
import { TopBarComponent } from "./topbar/TopBarComponent.js";
import { loadGD, saveGD, UI_COMPONENT_DATA, UI_TOPBAR } from "./UIData.js";


// note! instantiated *before* the world manager. 
// for elements within this object, soft-link to your dependencies from world. (see colorHueSlider.js)

export class UIManager {
    constructor(mainManager) {
        this.mainManager = mainManager;

        this._config = {} // accessed via '.config()' method within Component.js
        this.topbarConfig = {}  // accessed directly
        this.toolbarConfig = { 
            activeTool: 2,
            activeBrushMode: 0,
            clickMode: 1
        } // ...
        this.colorConfig = {
            h: 0,
            s: 0.5,
            v: 0.5,
            rgbArr: [127, 127, 127],
            rgbArrHistory: []
        }

        this.astronomyAtlasComponent = new AstronomyAtlasComponent(this);
        this.planeManagerComponent = new PlaneManagerComponent(this);
        this.blockManagerComponent = new BlockManagerComponent(this);
        this.topBarComponent = new TopBarComponent(this);
        this.toolBarComponent = new ToolBarComponent(this);
        
        this.colorPickerComponent = new ColorPickerComponent(this);

        this.components = [
            // this.astronomyAtlasComponent,
            // this.blockManagerComponent,
            // this.planeManagerComponent,
            this.topBarComponent,
            this.toolBarComponent,
            this.colorPickerComponent
        ]
    }

    colorUpdate() {
        this.colorConfig.rgbArrHistory.push(this.colorConfig.rgbArr);
        this.colorConfig.rgbArr = hsv2rgb(this.colorConfig.h, this.colorConfig.s, this.colorConfig.v); // creates a new array
        multiplyVectorByScalar(this.colorConfig.rgbArr, 255)
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

    update() {
        this.components.forEach((component) => component.update());
    }

    render() {
        this.components.forEach((component) => component.render());
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
        return this.mainManager.worldManager.timeManager.curDay;
    }
    getCurTimeScale() {
        return this.mainManager.worldManager.timeManager.curTimeScale;
    }
    setCurTimeScale(val) {
        this.mainManager.worldManager.timeManager.curTimeScale = val;
    }
    
}
