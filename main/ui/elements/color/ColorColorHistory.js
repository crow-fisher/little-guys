import { hsvToHex, hsvToRgba, rgbToHex } from "../../../color/color.js";
import { lerp } from "../../../common.js";
import { tau } from "../../../util/const.js";
import { addVectors } from "../../../util/vector.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorActiveColor extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, steps = 50) {
        super(window, sizeXFunc, sizeYFunc); 
        this.colorConfig = this.window.component.uiManager.colorConfig;
        this.steps = steps;
    }

    render(startX, startY) {
        this.window.getContext().fillStyle = rgbToHex(...this.colorConfig.rgbArr);
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
    }

}
