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
    constructor(pArr, color, z) {
        super();
        this.pArr = pArr;
        this.color = color;
        this.z = z;
    }

    render() {
        MAIN_CONTEXT.fillStyle = this.color;
        fillCanvasPointArr(this.pArr);
    }

    getZ() {
        return this.z;
    }
}

const renderJobs = new Array();

export function addRenderJob(renderJob) {
    if (renderJob.isVisible())
        renderJobs.push(renderJob);
}

export function executeRenderJobs() {
    // renderJobs.sort((a, b) => a.getZ() - b.getZ());
    // renderJobs.sort((a, b) => b.getZ() - a.getZ()); // super expensive for the stars!!!
    for (let i = 0; i < renderJobs.length; i++) {
        renderJobs.at(i).render();
    }
    renderJobs.length = 0;
}