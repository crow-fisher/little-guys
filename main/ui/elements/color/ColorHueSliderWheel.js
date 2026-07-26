import { hsvToHex, hsvToRgba } from "../../../color/color.js";
import { tau } from "../../../util/const.js";
import { addVectors } from "../../../util/vector.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorHueSliderWheel extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, steps=50) {
        super(window, sizeXFunc, sizeYFunc);
        this.steps = steps;
        this.colorConfig = this.window.component.uiManager.colorConfig;
        this.mouseManager = this.window.component.uiManager.mainManager.inputManager.mouseManager;
    }

    size() {
        return [this.sizeXFunc(), 0];
    }

    render(startX, startY) {
        this.timeManager = this.timeManager ?? this.window.component.uiManager.mainManager.worldManager.timeManager;
        if (this.timeManager == null) {
            return;
        }

        this.window.getContext().fillStyle = hsvToHex(this.colorConfig.h, this.colorConfig.s, this.colorConfig.v);
        this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());


        let midpoint = [startX, startY];
        midpoint[0] += this.sizeXFunc() / 2;
        midpoint[1] += this.sizeYFunc() / 2;

        let p1 = [0, 0];
        let p2 = [0, 0];
        let p3 = [0, 0];
        let p4 = [0, 0];

        for (let i = 0; i < this.steps; i++) {
            p1[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * (i / this.steps));
            p1[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * (i / this.steps));

            p2[0] = midpoint[0] + (this.sizeXFunc() / 2) * Math.cos(tau * (i / this.steps));
            p2[1] = midpoint[1] + (this.sizeYFunc() / 2) * Math.sin(tau * (i / this.steps));

            p3[0] = midpoint[0] + (this.sizeXFunc() / 2) * Math.cos(tau * ((i + 1) / this.steps));
            p3[1] = midpoint[1] + (this.sizeYFunc() / 2) * Math.sin(tau * ((i + 1) / this.steps));

            p4[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * ((i + 1) / this.steps));
            p4[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * ((i + 1) / this.steps));

            let gradient = this.window.getContext().createLinearGradient(...p1, ...p4);

            gradient.addColorStop(0, hsvToHex((i / this.steps) * 360, 1, 1));
            gradient.addColorStop(1, hsvToHex(((i + 1) / this.steps) * 360, 1, 1));

            this.window.getContext().fillStyle = gradient;

            // this.window.getContext().fillStyle = hsvToHex((i / this.steps) * 360, 1, 1);
            this.window.getContext().beginPath()
            this.window.getContext().moveTo(...p1);
            this.window.getContext().lineTo(...p2)
            this.window.getContext().lineTo(...p3)
            this.window.getContext().lineTo(...p4)
            this.window.getContext().lineTo(...p1)
            this.window.getContext().closePath();
            this.window.getContext().fill();
        }
    }

    interact(posX, posY) {
        let midpoint = [startX, startY];
        midpoint[0] += this.sizeXFunc() / 2;
        midpoint[1] += this.sizeYFunc() / 2;

        console.log(midpoint);

        
    }

}