import { HUEMAP } from "../color/hue.js";
import { hsvToHex } from "../color/color.js";

export class CanvasManager {
    constructor(elementId) {
        this.canvas = document.getElementById(elementId);
        this.context = this.canvas.getContext('2d');
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.context.fillStyle = hsvToHex((Date.now() / 10) % 360 + 60, .2, .25)
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        this.context.font =  this.canvas.width / 20 + "px courier";
        this.context.fillStyle = "#000000"
        this.context.fillText((new Date()).toISOString(), 0,this.canvas.height / 10);
    }

    addCallbacks(mainManager) {
        this.canvas.addEventListener('mousemove', () => mainManager.mousemove, false);
        this.canvas.addEventListener('mousedown', () => mainManager.mousedown);
        this.canvas.addEventListener('mouseup', () => mainManager.mouseup);

        this.canvas.onkeydown = () => mainManager.onkeydown;
        this.canvas.onkeyup = () => mainManager.onkeyup;
        this.canvas.onwheel = () => mainManager.onwheel;
    }
}