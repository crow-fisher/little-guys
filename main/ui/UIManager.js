import { RuntimeComponent } from "../runtimeComponent.js";

export class UIManager extends RuntimeComponent {
    constructor() {
        super();
    }

    update() {
        return;
        this.components.sort((b, a) => (a.lastTouched ?? 0) - (b.lastTouched ?? 0))
        this.components.filter((c) => c.activeFunc()).forEach((component) => component.update());
    }

    render() {
        return;
        this.components.sort((a, b) => (a.lastTouched ?? 0) - (b.lastTouched ?? 0))
        this.components.filter((c) => c.activeFunc()).forEach((component) => component.render());
    }
    
}
