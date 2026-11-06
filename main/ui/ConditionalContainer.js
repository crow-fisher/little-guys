import { Container } from "./Container.js";

export class ConditionalContainer extends Container {
    constructor(dir, func) {
        super(dir);
        this.func = func;
    }

    size() {
        if (this.func()) {
            return super.size();
        } else {
            return [0, 0];
        }
    }

    render(startX, startY) {
        if (this.func())
            return super.render(startX, startY);
    }

    interact(posX, posY) {
        if (this.func())
            return super.interact(posX, posY);
    }
}