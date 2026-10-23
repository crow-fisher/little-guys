export class RenderJob {
    constructor() {
        this.z = 0;
    }

    shouldRender() {
        return true;
    }

    getZ() {
        return this.z;
    }

    render() {
    }

    isVisible() {
        return true;
    }
}

