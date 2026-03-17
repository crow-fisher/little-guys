import { fillCanvasPointArr, getBaseUISize } from "../canvas.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { RenderJob } from "./model/RenderJob.js";


const noSortRenderJobs = new Array();
const renderJobs = new Array();

let prevNoSortRenderJobsLength = 0;
export function getNoSortRenderJobsLength() {
    return prevNoSortRenderJobsLength;
}

export function addRenderJob(renderJob, sort) {
    if (renderJob == null || renderJob.isVisible == null) {
        return;
    }
    if (renderJob != null && renderJob.isVisible()) {
        ((sort) ? renderJobs : noSortRenderJobs).push(renderJob);
    }
}
export function executeRenderJobs() {
    for (let i = 0; i < noSortRenderJobs.length; i++) {
        if (noSortRenderJobs.at(i).getZ() > 0)
            noSortRenderJobs.at(i).render();
    }
    prevNoSortRenderJobsLength = noSortRenderJobs.length;
    noSortRenderJobs.length = 0;
    renderJobs.sort((a, b) => b.getZ() - a.getZ());
    for (let i = 0; i < renderJobs.length; i++) {
        renderJobs.at(i).render();
    }
    renderJobs.length = 0;
}