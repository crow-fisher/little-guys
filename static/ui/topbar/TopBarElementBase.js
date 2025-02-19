import { MAIN_CONTEXT } from "../../index.js";

export class TopBarElementBase {
    constructor(fontSize) {
        this.fontSize = fontSize;
    }
    prepareStyle() {
        MAIN_CONTEXT.font = this.fontSize + "px courier"
        MAIN_CONTEXT.textAlign = 'right';
        MAIN_CONTEXT.textBaseline = 'alphabetic';
    }
    measure() { return [0, 0] }
    render() {}
}