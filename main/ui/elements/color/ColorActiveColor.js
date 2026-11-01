import { rgbToRgba } from "../../../color/color.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorActiveColor extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, steps = 50) {
        super(window, sizeXFunc, sizeYFunc); 
        this.colorConfig = this.window.component.config().colorConfig;
        this.steps = steps;
    }

    render(startX, startY) {
        this.window.getContext().fillStyle = this.window.component.uiManager.mainManager.timeManager.colorHEX;
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());

        this.window.getContext().fillStyle = rgbToRgba(...this.colorConfig.rgbaArr);
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());
    }

    
}
