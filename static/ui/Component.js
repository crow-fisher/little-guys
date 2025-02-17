import { Window } from "./Window.js";

export class Component {
    constructor() {
        this.window = new Window(100, 100, 10, 0);
    }

    render() {
        this.window.render();
    }

    update() {
        this.window.update();
    }
}