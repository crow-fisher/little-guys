export class KeyboardManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.keyPressMap = {};
    }
    onkeydown(e) {
        this.keyPressMap[e.key] = true;
    }
    onkeyup(e) {
        this.keyPressMap[e.key] = false;
    }
}