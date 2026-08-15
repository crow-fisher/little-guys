export class CrosshairComponent {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.activeFunc = () => this.canvasManager.pointerLock
        this.canvasManager = uiManager.mainManager.canvasManager;
        this.mouseManager = uiManager.mainManager.inputManager.mouseManager;
        this.lastTouched = Date.now() * 2;
    }
    render() {
        this.renderCrosshair();
    }

    update() {}

    renderCrosshair() {
        let canvas = this.canvasManager.canvas;
        let ctx = this.canvasManager.context;
        ctx.beginPath();

        ctx.strokeStyle = "rgba(255, 255, 255, .1)"
        ctx.lineWidth = .1;

        let cSize = 4 * this.uiManager.getBaseUISize();

        ctx.moveTo(this.mouseManager.offset.x, this.mouseManager.offset.y - cSize);
        ctx.lineTo(this.mouseManager.offset.x, this.mouseManager.offset.y + cSize);
        ctx.moveTo(this.mouseManager.offset.x - cSize, this.mouseManager.offset.y);
        ctx.lineTo(this.mouseManager.offset.x + cSize, this.mouseManager.offset.y);
        ctx.stroke();
    }
}