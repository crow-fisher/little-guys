export class WindowElement { 
    constructor(window, sizeXFunc, sizeYFunc, component=null) {
        // component is only required for objects that interact with config state
        this.window = window;
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;
        this.component = component;
    }
    size() {
        return [this.sizeXFunc(), this.sizeYFunc()];
    }
    render(startX, startY) {}
    interact(posX, posY) {}
    interactClick(posX, posY) {}
}