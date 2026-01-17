import { fillCanvasPointArr } from "./canvas.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CANVAS, MAIN_CONTEXT } from "./index.js";

export class RenderJob {
    constructor() {

    }


    getZ() {

    }

    render() {

    }

    isVisible() {
        return true;
    }
}

export class PointRenderJob extends RenderJob {
    constructor(x, y, z, size, color) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = Math.max(0, size);
        this.color = color;
    }

    isVisible() {
        return (this.x > 0 && this.x < getTotalCanvasPixelWidth() && this.y > 0 && this.y < getTotalCanvasPixelHeight());
    }

    render() {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = this.color;
        MAIN_CONTEXT.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
    }

    getZ() {
        return this.z;
    }
}

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

export class QuadRenderJob extends RenderJob {
    constructor(p1, p2, p3, p4, color, z) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
        this.color = color;
        this.z = z;
    }

    render() {
        MAIN_CONTEXT.fillStyle = this.color;
        MAIN_CONTEXT.beginPath()
        MAIN_CONTEXT.moveTo(...this.p1);
        MAIN_CONTEXT.lineTo(...this.p2);
        MAIN_CONTEXT.lineTo(...this.p4);
        MAIN_CONTEXT.lineTo(...this.p3);
        MAIN_CONTEXT.lineTo(...this.p1);
        MAIN_CONTEXT.closePath();
        MAIN_CONTEXT.fill();
    }

    getZ() {
        return this.z;
    }
}

const noSortRenderJobs = new Array();
const renderJobs = new Array();

export function addRenderJob(renderJob, sort) {
    if (renderJob.isVisible()) {
        ((sort) ? renderJobs : noSortRenderJobs).push(renderJob);
    }
}
export function executeRenderJobs() {
    for (let i = 0; i < noSortRenderJobs.length; i++) {
        noSortRenderJobs.at(i).render();
    }
    noSortRenderJobs.length = 0;
    renderJobs.sort((a, b) => b.getZ() - a.getZ());
    for (let i = 0; i < renderJobs.length; i++) {
        renderJobs.at(i).render();
    }
    renderJobs.length = 0;
}