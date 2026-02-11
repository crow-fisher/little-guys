import { COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { RenderJob } from "./RenderJob.js";

export class QuadRenderJob extends RenderJob {
    constructor(tl, bl, br, tr, color, z) {
        super();
        this.tl = tl;
        this.bl = bl;
        this.br = br;
        this.tr = tr;
        this.color = color;
        this.z = z;
    }

    render() {
        MAIN_CONTEXT.fillStyle = this.color;
        MAIN_CONTEXT.beginPath()
        MAIN_CONTEXT.moveTo(...this.tl);
        MAIN_CONTEXT.lineTo(...this.bl);
        MAIN_CONTEXT.lineTo(...this.br);
        MAIN_CONTEXT.lineTo(...this.tr);
        MAIN_CONTEXT.lineTo(...this.tl);
        MAIN_CONTEXT.closePath();
        MAIN_CONTEXT.fill();
    }

    getZ() {
        return this.z;
    }
}
