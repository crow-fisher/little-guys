import { MAIN_CONTEXT } from "../../index.js";

export class TopBarElementBase {
    constructor(fontSize, textAlign) {
        this.fontSize = fontSize;
        this.textAlign = textAlign;
    }
    prepareStyle() {
        MAIN_CONTEXT.font = this.fontSize + "px customCourier"
        MAIN_CONTEXT.textAlign = this.textAlign;
        MAIN_CONTEXT.textBaseline = 'alphabetic';
    }
    measure() { return [0, 0] }
    render() {}
    hover(posX, posY) {}
}