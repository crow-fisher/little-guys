import { hsvToHex } from "../color/color.js";
import { RuntimeComponent } from "../runtimeComponent.js";
// import { AstronomyAtlasComponent } from "./components/AstronomyAtlas/AstronomyAtlasComponent.js";
// import { BlockAttributeComponent } from "./components/BlockAttributeComponent.js";
// import { ColorPickerComponent } from "./components/ColorPickerComponent.js";
// import { CrosshairComponent } from "./components/CrosshairComponent.js";
// import { PlaneManagerComponent } from "./components/PlaneManager/PlaneManagerComponent.js";
// import { ToolBarComponent } from "./toolbar/ToolBarComponent.js";
// import { TopBarComponent } from "./topbar/TopBarComponent.js";
// import { TB_ASTRONOMY, TB_BLOCK_ATTRIBUTE, TB_BLOCK_COLOR } from "./topbar/topBarEnum.js";


// note! instantiated *before* the world manager. 
// for elements within this object, soft-link to your dependencies from world. (see colorHueSlider.js)

export class UIManager extends RuntimeComponent {
    constructor() {
        super();
        this._config = {} // accessed via '.config()' method within Component.js
        this.topbarConfig = {}  // accessed directly
        this.toolbarConfig = { 
            activeTool: 2,
            activeBrushMode: 1,
            clickMode: 0
        } // ...
        this.astronomyAtlasComponent = null; //  = new AstronomyAtlasComponent(this, () => this.topbarConfig.active == TB_ASTRONOMY);
        this.planeManagerComponent = null; //  = new PlaneManagerComponent(this);
        this.topBarComponent = null; //  = new TopBarComponent(this);
        this.toolBarComponent = null; //  = new ToolBarComponent(this);
        this.colorPickerComponent = null; //  = new ColorPickerComponent(this, () => this.topbarConfig.active == TB_BLOCK_COLOR);
        this.blockAttributeComponent = null; //  = new BlockAttributeComponent(this, () => this.topbarConfig.active == TB_BLOCK_ATTRIBUTE);
        this.crosshairComponent = null; //  = new CrosshairComponent(this);

        this.components = [
            this.astronomyAtlasComponent,
            this.blockAttributeComponent,
            this.topBarComponent,
            this.toolBarComponent,
            this.colorPickerComponent,
            // this.crosshairComponent
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

    requestTouch() {
        if (!this.frameLastTouched) {
            this.frameLastTouched = true;
            return true;
        } else {
            return false;
        }
    }

    update() {
        return;
        this.frameLastTouched = false;
        this.components.sort((b, a) => (a.lastTouched ?? 0) - (b.lastTouched ?? 0))
        this.components.filter((c) => c.activeFunc()).forEach((component) => component.update());
    }

    render() {
        return;
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
        return this.mainManager.timeManager.curTimeScale;
    }
    setCurTimeScale(val) {
        this.mainManager.timeManager.curTimeScale = val;
    }
    
}
