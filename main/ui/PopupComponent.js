import { getCanvasHeight, getCanvasWidth } from "../canvas.js";
import { MAIN_CONTEXT } from "../index.js";
import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";

export class PopupComponent {
    constructor(posXFunc, posYFunc, padding, dir, key, backgroundRgba="rgba(0, 0, 0, 0.4)") {
        this.window = new Window(posXFunc(), posYFunc(), padding, dir, true);
        this.key = key;
        this.posXFunc = posXFunc;
        this.posYFunc = posYFunc;
        this.backgroundRgba = backgroundRgba;
    }

    render() {
        if (loadGD(this.key)) {
            MAIN_CONTEXT.fillStyle = this.backgroundRgba;
            MAIN_CONTEXT.fillRect(0, 0, getCanvasWidth(), getCanvasHeight());
            this.window.render();
        }
    }

    update() {
        this.window.posX = this.posXFunc() - (this.window.sizeX / 2);
        this.window.posY = this.posYFunc() - (this.window.sizeY / 2);
        if (loadGD(this.key)) {
            this.window.update();
        }
    }
}