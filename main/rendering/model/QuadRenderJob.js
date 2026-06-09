import { RenderJob } from "./RenderJob.js";

export class QuadRenderJob extends RenderJob {
    constructor(context, p1, p2, p3, p4, color) {
        super(context);
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.p4 = p4;
        this.color = color;
        this.z = 0;
    }

    update() {
        this.z = this.getZ();
    }

    render() {
        if (this.p1 == null) {
            return;
        }
        this.context.fillStyle = this.color;
        this.context.beginPath()
        this.context.moveTo(...this.p1);
        this.context.lineTo(...this.p2);
        this.context.lineTo(...this.p3);
        this.context.lineTo(...this.p4);
        this.context.closePath();
        this.context.fill();
    }

    getZ() {
        if (this.p1 == null) {
            return 0;
        }
        return Math.min(
            this.p1[2],
            this.p3[2],
            this.p4[2],
            this.p2[2]
        );
    }
}
