export class RenderJob {
    constructor(rasterizationManager) {
        this.rasterizationManager = rasterizationManager;
        this.context = rasterizationManager.canvasManager.context;
        this.z = 0;
    }

    update() {
        this.z = 0; // calculate this every frame in your implementation class.
    }
    render() {
    }
}

