import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";

export class LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key, center=false, windowBackground=true) {
        this.window = new Window(posXFunc(), posYFunc(), padding, dir, true, windowBackground);
        this.key = key;
        this.posXFunc = posXFunc;
        this.posYFunc = posYFunc;
        this.center = center;
    }

    render() {
        if (loadGD(this.key)) {
            this.window.render();
        }
    }

    update() {
        let dx = this.center ? (this.window.sizeX * -.5) : 0;
        this.window.posX = this.posXFunc() + dx;
        this.window.posY = this.posYFunc();
        if (loadGD(this.key)) {
            this.window.update();
        }
    }
}