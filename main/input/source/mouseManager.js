import { hsvToHex } from "../../color/color.js";

export class MouseManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.ms = 0;
        this.pms = 0;
        this.offset = {x: 0, y: 0};
        this.poffset = {x: 0, y: 0};
        this.doffset = {x: 0, y: 0};
    }

    buttonPressed(b) {
        return (1 << b) && this.ms;
    }

    frameButtonPressed(b) {
        return (1 << b) && (this.ms - this.pms) == (1 << b);
    }

    mousedown(e) {
        this.ms |= (1 << e.button); 
    }

    mouseup(e) {
        this.ms &= ~(1 << e.button); 
    }

    mousemove(e) {
        this.offset = this.getOffset(e);
    }

    update() {
        this.pms = this.ms;
        this.doffset.x = this.offset.x - this.poffset.x;
        this.doffset.y = this.offset.y - this.poffset.y;
        this.poffset = this.offset;
    }

    render() {
        this.mainManager.canvasManager.context.fillStyle = hsvToHex(this.ms * 60, .8, .75);
        this.mainManager.canvasManager.context.beginPath();
        this.mainManager.canvasManager.context.arc(this.offset.x, this.offset.y, 8, 0, 2 * Math.PI, false);
        this.mainManager.canvasManager.context.fill();
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