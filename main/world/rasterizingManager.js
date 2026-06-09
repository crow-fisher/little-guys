export class RasterizationManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.canvasManager = worldManager.mainManager.canvasManager;
        
        this.quadRenderJobs = new Array();
        this.frameQuadRenderJobs = 0;

        this.sortedRenderJobs = new Array();
    }

    update() {
        this.frameQuadRenderJobs = 0;
    }
    
    renderQuad(p1, p2, p3, p4, color) { 
        if (Math.min(p1[2], p2[2], p3[2], p4[2]) > 0) {
            return;
        }
        this.quadRenderJobs[this.frameQuadRenderJobs] = this.quadRenderJobs[this.frameQuadRenderJobs] ?? [0, 0, 0, 0, "#FFFFFF"];

        this.quadRenderJobs[this.frameQuadRenderJobs][0] = p1;
        this.quadRenderJobs[this.frameQuadRenderJobs][1] = p2;
        this.quadRenderJobs[this.frameQuadRenderJobs][2] = p3;
        this.quadRenderJobs[this.frameQuadRenderJobs][3] = p4;
        this.quadRenderJobs[this.frameQuadRenderJobs][4] = color;

        this.frameQuadRenderJobs += 1;
    }

    render() {
        if (this.frameQuadRenderJobs == 0) {
            return;
        }

        this.quadRenderJobs.length = this.frameQuadRenderJobs;
        this.quadRenderJobs.sort((a, b) => {
            Math.min(...a.slice(0, 4).map((v) => v[2])) > 
            Math.min(...b.slice(0, 4).map((v) => v[2]))
        });

        this.quadRenderJobs.forEach((arr) => {
            this.canvasManager.context.fillStyle = arr[4];
            this.canvasManager.context.beginPath();
            this.canvasManager.context.moveTo(...arr[0])
            this.canvasManager.context.lineTo(...arr[1])
            this.canvasManager.context.lineTo(...arr[2])
            this.canvasManager.context.lineTo(...arr[3])
            this.canvasManager.context.closePath();
            this.canvasManager.context.fill();
        });
                
    }
        
}