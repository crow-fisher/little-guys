import { Container } from "./Container.js";
import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";

export class Component {
    constructor(uiManager) {
        this.name = "Component";
        this.uiManager = uiManager;
        this.window = new Window(uiManager);
        this.container = new Container(this.window, 1);
        this.window.container = this.container;
    }
 
    // core runtime methods
    render() {
        this.window.render(this.gcvOffsetX(), this.gcvOffsetY());
    }
    update() {
        this.window.update(this.gcvOffsetX(), this.gcvOffsetY());
    }
    configInit() {
        this.uiManager.config[this.name] = this.uiManager.config[this.name] ?? this.getDefaultConfig();
    }
    getDefaultConfig() {
        return {
            offsetScale: [100, 100, 600, 600]
        }
    }
    // "gco" == "get config object"
    gcoOffsetScale() {
        return this.uiManager.config[this.name].offsetScale;
    }
    // "gcv" == "get config value"
    gcvOffsetX() {
        return this.gcoOffsetScale()[0];
    }
    gcvOffsetY() {
        return this.gcoOffsetScale()[1];
    }
    gcvSizeX() {
        return this.gcoOffsetScale()[2];
    }
    gcvSizeY() {
        return this.gcoOffsetScale()[3];
    }
    // "ggv" == "get global value"
    ggvUISize() {
        return this.uiManager.getBaseUISize();
    }
    // "ggvd" == "get global value derivative"
    ggvdH1() {
        return this.ggvUISize() *  4;
    }
    ggvdH2() {
        return this.ggvUISize() *  3;
    }
    ggvdH3() {
        return this.ggvUISize() * 2.5;
    }
    ggvdBr() {
        return this.ggvUISize() *  1;
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
