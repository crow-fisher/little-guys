import { getBaseUISize } from "../../canvas.js";
import { MAIN_CONTEXT } from "../../index.js";
import { RenderJob } from "./RenderJob.js";

export class PointLabelRenderJob extends RenderJob {
    constructor(x, y, z, size, color, label) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = Math.max(0, size);
        this.color = color;
        this.label = label;
    }
    
    getZ() {
        return this.z;
    }

    render() {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = this.color;
        MAIN_CONTEXT.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();

        if (this.label) { 
            MAIN_CONTEXT.font = getBaseUISize() * 3 + "px courier";
            MAIN_CONTEXT.fillText(this.label, this.x + getBaseUISize() * 3, this.y);
        }
    }

    getZ() {
        return this.z;
    }
}