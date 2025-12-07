import { fillCanvasPointArr } from "./canvas.js";
import { MAIN_CANVAS, MAIN_CONTEXT } from "./index.js";

export class RenderJob {
    constructor() {

    }


    getZ() {

    }

    render() {

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
    renderJobs.push(renderJob);
}

export function executeRenderJobs() {
    // renderJobs.sort((a, b) => a.getZ() - b.getZ());
    renderJobs.sort((a, b) => b.getZ() - a.getZ());
    renderJobs.forEach((job) => job.render());
    renderJobs.length = 0;
}