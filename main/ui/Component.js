import { Container } from "./Container.js";
import { loadGD, UI_TOPBAR_AA } from "./UIData.js";
import { Window } from "./Window.js";

export class Component {
    constructor(uiManager) {
        this.name = "Component";
        this.uiManager = uiManager;
        this.window = new Window(this);
        this.container = new Container(this.window, 1);
        this.window.container = this.container;
        this.dirtyConfig = false;
    }

    /// core runtime methods
    // rendering
    render() {
        if (!loadGD(UI_TOPBAR_AA)) {
            return;
        }
        this.window.render(this.gcvOffsetX(), this.gcvOffsetY());
    }
    // input interactions
    update() {
        this._curConfig = JSON.stringify(this.config());
        if (this._curConfig != this._pastConfig) {
            this.dirtyConfig = true;
        } else {
            this.dirtyConfig = false;
        }
        this._pastConfig = this._curConfig;
        if (this.window.shouldRegisterMouseInput())
            this.window.update(this.gcvOffsetX(), this.gcvOffsetY());
    }

    /// core config setup methods
    // sets up the config state in this object to have required values for any components
    configInit() {
        this.uiManager._config[this.name] = this.uiManager._config[this.name] ?? this.getDefaultConfig();
    }
    // the method you should extend to provide all required config parameters your component needs to function
    getDefaultConfig() {
        return {
            offsetScale: {
                offsetX: this.ggvUISize() * 12,
                offsetY: this.ggvUISize() * 12,
                sizeX: this.ggvUISize() * 20,
                sizeY: this.ggvUISize() * 20
            }
        }
    }
    config() {
        return this.uiManager._config[this.name];
    }
    // "gcv" == "get config value"
    gcvOffsetX() {
        return this.config().offsetScale.offsetX;
    }
    gcvOffsetY() {
        return this.config().offsetScale.offsetY;
    }
    gcvSizeX() {
        return this.config().offsetScale.sizeX;
    }
    gcvSizeY() {
        return this.config().offsetScale.sizeY;
    }
    // "mcv" == "modify config value"
    mcvOffsetX(v) {
        this.config().offsetScale.offsetX += v;
    }
    mcvOffsetY(v) {
        this.config().offsetScale.offsetY += v;
    }
    mcvSizeX(v) {
        this.config().offsetScale.sizeX += v;
    }
    mcvSizeY(v) {
        this.config().offsetScale.sizeY += v;
    }
    // "ggv" == "get global value"
    ggvUISize() {
        return this.uiManager.getBaseUISize();
    }
    // "ggvd" == "get global value derivative"
    ggvdH1() {
        return this.ggvUISize() * 4;
    }
    ggvdH2() {
        return this.ggvUISize() * 3;
    }
    ggvdH3() {
        return this.ggvUISize() * 2.5;
    }
    ggvdBr() {
        return this.ggvUISize() * 1;
    }
    // "gcvd" == "get config value derivative"
    gcvdHalfX() {
        return this.gcvSizeX() / 2;
    }
    gcvdHalfX() {
        return this.gcvSizeX() / 2;
    }
    gcvdThirdX() {
        return this.gcvSizeX() / 3;
    }
    gcvdFourthX() {
        return this.gcvSizeX() / 4;
    }
    gcvdFifthX() {
        return this.gcvSizeX() / 5;
    }
    gcvdHalfY() {
        return this.gcvSizeY() / 2;
    }
    gcvdHalfY() {
        return this.gcvSizeY() / 2;
    }
    gcvdThirdY() {
        return this.gcvSizeY() / 3;
    }
    gcvdFourthY() {
        return this.gcvSizeY() / 4;
    }
    gcvdFifthY() {
        return this.gcvSizeY() / 5;
    }
}
