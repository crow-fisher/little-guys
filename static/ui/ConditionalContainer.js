import { Container } from "./Container.js";
import { loadUI } from "./UIData.js";
import { WindowElement } from "./Window.js";

export class ConditionalContainer extends Container {
    constructor(window, padding, dir, func) {
        super(window, padding, dir);
        this.func = func;
    }

    size() {
        if (this.func()) {
            return super.size();
        } else {
            return [0, 0];
        }
    }

    render(startX, startY) {
        if (this.func()) {
            return super.render(startX, startY);
        } else {
            return [0, 0];
        }
    }

    hover(posX, posY) { 
        if (this.func()) {
            return super.hover(posX, posY);
        } else {
            return [0, 0];
        }
    }
}