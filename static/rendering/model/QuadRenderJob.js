import { COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CONTEXT } from "../../index.js";
import { RenderJob } from "./RenderJob.js";

export class QuadRenderJob extends RenderJob {
    constructor(tl, bl, br, tr, color) {
        super();
        this.tl = tl;
        this.bl = bl;
        this.br = br;
        this.tr = tr;
        this.color = color;
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

    shouldRender() {
        return this.getZ() > 0 && 
            this.getMinP(0) > 0 && 
            this.getMinP(1) > 0 && 
            this.getMaxP(0) < getTotalCanvasPixelWidth() && 
            this.getMaxP(1) < getTotalCanvasPixelHeight()
    }

    getZ() {
        return Math.min(
            this.tl[2],
            this.bl[2],
            this.br[2],
            this.tr[2]
        );
    }

    getMinP(idx) {
        return Math.min(
            this.tl[idx],
            this.bl[idx],
            this.br[idx],
            this.tr[idx]
        );
    }
    getMaxP(idx) {
        return Math.max(
            this.tl[idx],
            this.bl[idx],
            this.br[idx],
            this.tr[idx]
        );
    }
}
