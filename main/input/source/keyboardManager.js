export class KeyboardManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.keyPressMap = {};
    }
    update() {}
    render() {}
    onkeydown(e) {
        this.keyPressMap[e.key] = true;
    }
    onkeyup(e) {
        this.keyPressMap[e.key] = false;
    }
}