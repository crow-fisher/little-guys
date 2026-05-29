import { Container } from "./Container.js";
import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";

export class Component {
    constructor(uiManager) {
        this.name = "Component";
        this.uiManager = uiManager;
        this.window = new Window(uiManager);
        this.container = new Container(this.window, 1);
    }

    loadOffsetScaleSizing() {
        this.offsetScale = this.uiManager.getDataKey(this.name, "offsetScale");

        this.h1 = this.uiManager.getBaseUISize() * 4;
        this.h2 = this.uiManager.getBaseUISize() * 3;
        this.h3 = this.uiManager.getBaseUISize() * 2.5;
        this.br = this.uiManager.getBaseUISize() * 1;

        this.posX = this.offsetScale[0];
        this.posY = this.offsetScale[1];
        this.sizeX = this.offsetScale[2];
        this.sizeY = this.offsetScale[3];

        this.half = this.sizeX / 2;
        this.third = this.sizeX / 3;
        this.fourth = this.sizeX / 4;
        this.fifth = this.sizeX / 5;

    }

    render() {
        if (loadGD(this.key)) {
            this.window.render(this.posX, this.posY);
        }
    }

    update() {
        if (loadGD(this.key)) {
            this.window.update(this.posX, this.posY);
        }
    }
}