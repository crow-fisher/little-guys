export class CrosshairComponent {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.canvasManager = uiManager.mainManager.canvasManager;
        this.mouseManager = uiManager.mainManager.inputManager.mouseManager;
        this.lastTouched = Date.now() * 2;
    }
    render() {
        if (this.canvasManager.pointerLock) {
            this.renderCrosshair();
        }
    }

    update() {}

    renderCrosshair() {
        let canvas = this.canvasManager.canvas;
        let ctx = this.canvasManager.context;
        ctx.beginPath();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;

        let cSize = 4 * this.uiManager.getBaseUISize();

        ctx.moveTo(this.mouseManager.offset.x, this.mouseManager.offset.y - cSize);
        ctx.lineTo(this.mouseManager.offset.x, this.mouseManager.offset.y + cSize);
        ctx.moveTo(this.mouseManager.offset.x - cSize, this.mouseManager.offset.y);
        ctx.lineTo(this.mouseManager.offset.x + cSize, this.mouseManager.offset.y);
        ctx.stroke();
    }
}