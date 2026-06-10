export class RenderJob {
    constructor(rasterizationManager) {
        this.rasterizationManager = rasterizationManager;
        this.context = rasterizationManager.canvasManager.context;
        this.z = 0;
    }

    getZ() {
        return 0;
    }
    update() {
        this.z = this.getZ();
    }
    render() {
    }
}

