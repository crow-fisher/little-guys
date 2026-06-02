export class WindowElement { 
    constructor(window, sizeXFunc, sizeYFunc, component=null) {
        // component is only required for objects that interact with config state
        this.window = window;
        this.sizeXFunc = sizeXFunc;
        this.sizeYFunc = sizeYFunc;
        this.component = component;
    }
    render(startX, startY) {}
    
    size() {
        return [this.sizeXFunc(), this.sizeYFunc()];
    }
    hover(posX, posY) {
        this.hovered = true;
    }

}