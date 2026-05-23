import { LockedComponent } from "./LockedComponent.js";
import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";
import { WorldPanWindow } from "./WorldPanWindow.js";

export class WorldPanLockedComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key, center=false, windowBackground=true) {
        super(posXFunc, posYFunc, padding, dir, key, center, windowBackground);
        this.window = new WorldPanWindow(posXFunc(), posYFunc(), padding, dir, true, windowBackground);
        this.key = key;
        this.posXFunc = posXFunc;
        this.posYFunc = posYFunc;
        this.center = center;
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