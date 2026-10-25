import { RuntimeComponent } from "../../runtimeComponent.js";

export class KeyboardManager extends RuntimeComponent {
    constructor(inputManager) {
        super();
        this.inputManager = inputManager;
        this.keyPressMap = {};
    }

    update() {}
    render() {}
    onkeydown(e) {
        this.keyPressMap[e.key.toLowerCase()] = true;
    }
    onkeyup(e) {
        this.keyPressMap[e.key.toLowerCase()] = false;
    }
}