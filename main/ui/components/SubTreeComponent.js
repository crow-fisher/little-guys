import { loadGD } from "../UIData.js";
import { Window } from "../Window.js";


export class SubTreeComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        this.window = new Window(posXFunc(), posYFunc(), padding, dir, true);
        this.key = key;
        this.posXFunc = posXFunc;
        this.posYFunc = posYFunc;
    }

    render() {
        if (loadGD(this.key)) {
            this.window.render();
            
        }
    }

    update() {
        this.window.posX = this.posXFunc();
        this.window.posY = this.posYFunc();
        if (loadGD(this.key)) {
            this.window.update();
        }
    }
}