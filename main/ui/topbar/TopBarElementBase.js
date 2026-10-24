export class TopBarElementBase {
    constructor(uiManager, fontSize, textAlign) {
        this.uiManager = uiManager;
        this.fontSize = fontSize;
        this.textAlign = textAlign;
    }
    prepareStyle() {
        this.uiManager.getContext().font = this.fontSize + "px courier"
        this.uiManager.getContext().textAlign = this.textAlign;
        this.uiManager.getContext().textBaseline = 'alphabetic';
    }
    measure() { return [0, 0] }
    render() {}
    interact(posX, posY) {}
}