import { COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT } from "../../index.js";
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

        if ((this.tl[0] < 0) || this.br[0] > getTotalCanvasPixelWidth()) {
            return;
        }
        if ((this.bl[0] < 0) || this.tr[0] > getTotalCanvasPixelWidth()) {
            return;
        }
        if ((this.tl[1] < 0) || this.br[1] > getTotalCanvasPixelHeight()) {
            return;
        }
        if ((this.bl[1] < 0) || this.tr[1] > getTotalCanvasPixelHeight()) {
            return;
        }

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
