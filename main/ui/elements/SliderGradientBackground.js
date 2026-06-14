import { hsvToHex } from "../../color/color.js";
import { WindowElement } from "../WindowElement.js";

export class SliderGradientBackground extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, getter, setter, min, max, hue, saturation) {
        super(window, sizeXFunc, sizeYFunc);
        this.getter = getter;
        this.setter = setter;
        this.min = min;
        this.max = max;
        this.hue = hue;
        this.saturation = saturation;
    }

    render(startX, startY) {
        if (isNaN(startX))
            return;
        let gradient = this.window.getContext().createLinearGradient(startX, startY, this.sizeXFunc() + startX, startY);
        gradient.addColorStop(0, hsvToHex(this.hue, this.saturation, 0));
        gradient.addColorStop(1, hsvToHex(this.hue, this.saturation, 1));
        this.window.getContext().fillStyle = gradient;
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());

        let blockSize = this.sizeYFunc();
        let invlerp = (this.getter() - this.min) / (this.max - this.min);
        let lerp = invlerp * this.sizeXFunc();

        this.window.getContext().fillStyle = hsvToHex(this.hue, this.saturation, invlerp);
        this.window.getContext().fillRect(startX + lerp - (blockSize / 2), startY, blockSize, this.sizeYFunc());
        this.window.getContext().fill();

        let lineWidth = this.window.getBaseUISize() * 0.1;
        this.window.getContext().strokeStyle = hsvToHex(this.hue, this.saturation, .1);        // set the color for the circle to 'green'
        this.window.getContext().lineWidth = lineWidth;
        this.window.getContext().strokeRect((startX + lineWidth / 2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeYFunc() - (lineWidth));

        return [this.sizeXFunc(), this.sizeYFunc()]
    }

    interact(posX, posY) {
        super.interact(posX, posY);
        let min = 0;
        let max = this.sizeXFunc();
        posX = Math.max((this.sizeYFunc() / 2), posX);
        posX = Math.min(this.sizeXFunc() - (this.sizeYFunc() / 2), posX);
        let p = (posX - min) / (max - min);
        p = Math.min(Math.max(0, p), 1)
        this.setter(this.min + (p * (this.max - this.min)))
    }

}