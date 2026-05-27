import { HUEMAP } from "../color/hue.js";
import { hsvToHex } from "../color/color.js";

export class CanvasManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.canvas = document.getElementById("main");
        this.context = this.canvas.getContext('2d');
        this.pointerLock = false;
        this.addCallbacks();
        this.resize();
    }

    lockPointer() {
        this.canvas.requestPointerLock({unadjustedMovement: true});
        this.pointerLock = true;
    }
    
    unlockPointer() {
        if (document.pointerLockElement == this.canvas) {
            document.exitPointerLock();
        }
        this.pointerLock = false;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        this.context.fillStyle = hsvToHex((Date.now() / 20) % 360 + 60, .3, .15)
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

    addCallbacks() {
        this.canvas.addEventListener('mousemove', (e) => this.mainManager.mousemove(e), false);
        this.canvas.addEventListener('mousedown', (e) => this.mainManager.mousedown(e));
        this.canvas.addEventListener('mouseup', (e) => this.mainManager.mouseup(e));

        this.canvas.addEventListener('onkeydown', (e) => this.mainManager.onkeydown(e));
        this.canvas.addEventListener('onkeyup', (e) => this.mainManager.onkeyup(e));
        this.canvas.onkeydown = () => this.mainManager.onkeydown();
        this.canvas.onkeyup = () => this.mainManager.onkeyup();
        this.canvas.onwheel = () => this.mainManager.onwheel();
    }
}