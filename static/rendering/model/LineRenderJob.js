import { MAIN_CONTEXT } from "../../index.js";
import { RenderJob } from "./RenderJob.js";

export class LineRenderJob extends RenderJob {
    constructor(v1, v2, size, color, z) {
        super();
        this.v1 = v1;
        this.v2 = v2;
        this.size = size;
        this.color = color;
        this.z = z;
    }

    render() {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.lineWidth = this.size;
        MAIN_CONTEXT.strokeStyle = this.color;
        MAIN_CONTEXT.moveTo(this.v1[0], this.v1[1]);
        MAIN_CONTEXT.lineTo(this.v2[0], this.v2[1]);
        MAIN_CONTEXT.stroke();
    }
}
