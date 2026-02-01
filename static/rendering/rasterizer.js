import { fillCanvasPointArr, getBaseUISize } from "../canvas.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";


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