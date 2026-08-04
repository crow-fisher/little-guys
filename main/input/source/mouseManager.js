import { hsvToHex } from "../../color/color.js";
import { loadGD, saveGD, UI_CAMERA_FOV } from "../../ui/UIData.js";

export class MouseManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.cameraManager = inputManager.mainManager.cameraManager;
        this.canvasManager = inputManager.mainManager.canvasManager;
        this.ms = 0;
        this.pms = 0;
        this.offset = { x: 0, y: 0 };
        this.poffset = { x: 0, y: 0 };
        this.doffset = { x: 0, y: 0 };
        this.movement = { x: 0, y: 0 };
    }

    isButtonPressed(b) {
        return (this.ms & (1 << b)) == (1 << b)
    }

    isFrameButtonPressed(b) {
        return (1 << b) && (this.ms - this.pms) == (1 << b);
    }

    mousedown(e) {
        if (e.button == 1) {
            e.preventDefault();

        }
        this.ms |= (1 << e.button);
    }

    mouseup(e) {
        this.ms &= ~(1 << e.button);
    }

    onwheel(e) {
        e.preventDefault();
        this.cameraManager.cameraFov *= (1 + e.deltaY / 4000);
        this.cameraManager.cameraFov = Math.min(this.cameraManager.cameraFov, 160)
    }

    mousemove(e) {
        this.offset = this.getOffset(e);
        if (this.canvasManager.pointerLock) {
            this.movement.x += e.movementX / 35000
            this.movement.y += e.movementY / 35000

            this.offset.x = this.canvasManager.canvas.width / 2;
            this.offset.y = this.canvasManager.canvas.height / 2;
        }
    }

    update() {
        this.pms = this.ms;
        this.doffset.x = this.offset.x - this.poffset.x;
        this.doffset.y = this.offset.y - this.poffset.y;
        this.poffset = this.offset;

        this.movement.x *= 0.7;
        this.movement.y *= 0.7;
    }

    render() {
        if (this.canvasManager.pointerLock) {
            return;
        }
        return;
        this.inputManager.getContext().fillStyle = hsvToHex(this.ms * 60, .8, .75);
        this.inputManager.getContext().beginPath();
        this.inputManager.getContext().arc(this.offset.x, this.offset.y, 8, 0, 2 * Math.PI, false);
        this.inputManager.getContext().fill();
    }

    getOffset(evt) {
        // Check if the event is a touch or mouse event and calculate the offset accordingly
        if (evt.touches) {
            // For touch events, use the first touch
            let touch = evt.touches[0];
            return { x: touch.pageX - evt.target.offsetLeft, y: touch.pageY - evt.target.offsetTop };
        } else if (evt.offsetX != undefined) {
            // For mouse events
            return { x: evt.offsetX, y: evt.offsetY };
        } else {
            // Fallback for older browsers
            let el = evt.target;
            let offset = { x: 0, y: 0 };
            while (el.offsetParent) {
                offset.x += el.offsetLeft;
                offset.y += el.offsetTop;
                el = el.offsetParent;
            }
            offset.x = evt.pageX - offset.x;
            offset.y = evt.pageY - offset.y;
            return offset;
        }
    }

}