export class RasterizationManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.canvasManager = mainManager.canvasManager;
        
        this.renderJobs = new Array();
        this.renderJobsLate = new Array();
        this.frameRenderJobs = 0;
        this.frameLateRenderJobs = 0;

        this.sortedRenderJobs = new Array();
    }

    addRenderJob(renderJob) {
        this.renderJobs[this.frameRenderJobs] = renderJob;
        this.frameRenderJobs += 1;
    }
    addLateRenderJob(renderJob) {
        this.renderJobsLate[this.frameLateRenderJobs] = renderJob;
        this.frameLateRenderJobs += 1;
    }
    

    update() {
        this.frameRenderJobs = 0;
        this.frameLateRenderJobs = 0;
    }

    render() {
        if (this.frameRenderJobs == 0) {
            return;
        }

        this.renderJobs.length = this.frameRenderJobs;
        this.renderJobs.forEach((renderJob) => renderJob.update());
        this.renderJobs.sort((a, b) => a.z - b.z);
        this.renderJobs.forEach((renderJob) => renderJob.render());

        
        this.renderJobsLate.length = this.frameLateRenderJobs;
        this.renderJobsLate.forEach((renderJob) => renderJob.update());
        this.renderJobsLate.sort((a, b) => a.z - b.z);
        this.renderJobsLate.forEach((renderJob) => renderJob.render());
    
    }
}