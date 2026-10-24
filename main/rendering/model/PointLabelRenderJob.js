import { RenderJob } from "./RenderJob.js";

export class PointLabelRenderJob extends RenderJob {
    constructor(rasterizationManager, pos, size, color, label) {
        super(rasterizationManager);
        this.uiManager = rasterizationManager.mainManager.uiManager;
        this.pos = pos;
        this.size = size; 
        this.color = color;
        this.label = label;
    }
    
    getZ() {
        return this.pos[2];
    }

    render() {
        this.context.beginPath();
        this.context.fillStyle = this.color;
        this.context.arc(this.pos[0], this.pos[1], this.size, 0, 2 * Math.PI, false);
        this.context.fill();
        if (this.label) { 
            this.context.font = this.uiManager.getBaseUISize() * 3 + "px courier";
            this.context.fillText(this.label, this.x + this.uiManager.getBaseUISize() * 3, this.y);
        }
    }

}