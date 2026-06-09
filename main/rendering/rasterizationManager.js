export class RasterizationManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.canvasManager = mainManager.canvasManager;
        
        this.renderJobs = new Array();
        this.frameQuadRenderJobs = 0;

        this.sortedRenderJobs = new Array();
    }

    addRenderJob(renderJob) {
        this.renderJobs[this.frameQuadRenderJobs] = renderJob;
        this.frameQuadRenderJobs += 1;
    }
    

    update() {
        this.frameQuadRenderJobs = 0;
    }

    render() {
        if (this.frameQuadRenderJobs == 0) {
            return;
        }

        this.renderJobs.length = this.frameQuadRenderJobs;
        
        this.renderJobs.forEach((renderJob) => renderJob.update());
        this.renderJobs.sort((a, b) => a.z - b.z);
        this.renderJobs.forEach((renderJob) => renderJob.render());
    
    }
}