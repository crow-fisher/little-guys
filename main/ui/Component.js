import { loadGD } from "./UIData.js";
import { Window } from "./Window.js";

export class Component {
    constructor(posX, posY, padding, dir, key) {
        this.window = new Window(posX, posY, padding, dir);
        this.key = key;
    }

    render() {
        if (loadGD(this.key)) {
            this.window.render();
        }
    }

    update() {
        if (loadGD(this.key)) {
            this.window.update();
        }
    }
}