import { RenderJob } from "./RenderJob.js";

export class LineRenderJob extends RenderJob {
    constructor(rasterizationManager, v1, v2, size, color) {
        super(rasterizationManager);
        this.v1 = v1;
        this.v2 = v2;
        this.size = size;
        this.color = color;
    }
    getZ() {
        return Math.min(this.v1[2], this.v2[2]);
    }
    render() {
        this.context.beginPath();
        this.context.lineWidth = this.size;
        this.context.strokeStyle = this.color;
        this.context.moveTo(this.v1[0], this.v1[1]);
        this.context.lineTo(this.v2[0], this.v2[1]);
        this.context.stroke();
    }
}
