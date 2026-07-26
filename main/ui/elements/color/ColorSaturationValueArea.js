import { hsvToHex, hsvToRgba } from "../../../color/color.js";
import { lerp } from "../../../common.js";
import { tau } from "../../../util/const.js";
import { addVectors } from "../../../util/vector.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorSaturationValueArea extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, steps = 50) {
        super(window, sizeXFunc, sizeYFunc); 
        this.colorConfig = this.window.component.uiManager.colorConfig;
        this.steps = steps;
    }

    size() {
        return [this.sizeXFunc(), 0];
    }

    render(startX, startY) {
        this.timeManager = this.timeManager ?? this.window.component.uiManager.mainManager.worldManager.timeManager;
        if (this.timeManager == null) {
            return;
        }

        let midpoint = [startX, startY];
        midpoint[0] += this.sizeXFunc() / 2;
        midpoint[1] += this.sizeYFunc() / 2;

        let p1 = [0, 0];
        let p2 = [0, 0];
        let p3 = [0, 0];
        let p4 = [0, 0];

        p1[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 1 / 8);
        p1[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 1 / 8);

        p2[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 3 / 8);
        p2[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 3 / 8);

        p3[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 5 / 8);
        p3[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 5 / 8);

        p4[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 7 / 8);
        p4[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 7 / 8);


        // these points outline the basis of the hue/saturation area from TR (top right), TL, BL, BR order. 
        // do some number of subdivisions with linear gradients going from BL to TR. 

        let _p1 = [0, 0];
        let _p2 = [0, 0];
        let _p3 = [0, 0];
        let _p4 = [0, 0];

        let nH = 10; // numHorizontalSubdivisions; 
        // let nV = 10; 


        // bottom left, top left, top right, bottom right 
        for (let i = 0; i < nH; i++) {
            _p1[0] = lerp(p3[0], p4[0], i / nH);
            _p1[1] = p3[1];

            _p2[0] = lerp(p3[0], p4[0], i / nH);
            _p2[1] = p2[1];

            _p3[0] = lerp(p3[0], p4[0], (i + 1) / nH);
            _p3[1] = p2[1];

            _p4[0] = lerp(p3[0], p4[0], (i + 1) / nH);
            _p4[1] = p3[1];

            this.window.getContext().fillStyle = hsvToHex(80, i / nH, 1);

            let gradient = this.window.getContext().createLinearGradient(..._p1, ..._p3);

            gradient.addColorStop(0, hsvToHex(this.colorConfig.h, 0, 1));
            gradient.addColorStop(1, hsvToHex(this.colorConfig.h, 1, 1));

            this.window.getContext().fillStyle = gradient;

            this.window.getContext().beginPath()
            this.window.getContext().moveTo(..._p1);
            this.window.getContext().lineTo(..._p2)
            this.window.getContext().lineTo(..._p3)
            this.window.getContext().lineTo(..._p4)
            this.window.getContext().lineTo(..._p1)
            this.window.getContext().closePath();
            this.window.getContext().fill();
            
            }

        // let _p1 = [0, 0];
        // let _p2 = [0, 0];
        // let _p3 = [0, 0];
        // let _p4 = [0, 0];

        // _p1[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 1 / 8);
        // _p1[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 1 / 8);

        // _p2[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 3 / 8);
        // _p2[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 3 / 8);

        // _p3[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 5 / 8);
        // _p3[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 5 / 8);

        // _p4[0] = midpoint[0] + (this.sizeXFunc() / 2.5) * Math.cos(tau * 7 / 8);
        // _p4[1] = midpoint[1] + (this.sizeYFunc() / 2.5) * Math.sin(tau * 7 / 8);


        // let gradient = this.window.getContext().createLinearGradient(...p1, ...p4);

        // gradient.addColorStop(0, hsvToHex((i / this.steps) * 360, 1, 1));
        // gradient.addColorStop(1, hsvToHex(((i + 1) / this.steps) * 360, 1, 1));

        // this.window.getContext().fillStyle = gradient;

        // this.window.getContext().fillStyle = hsvToHex(0, 1, 1);
        // this.window.getContext().beginPath()
        // this.window.getContext().moveTo(...p1);
        // this.window.getContext().lineTo(...p2)
        // this.window.getContext().lineTo(...p3)
        // this.window.getContext().lineTo(...p4)
        // this.window.getContext().lineTo(...p1)
        // this.window.getContext().closePath();
        // this.window.getContext().fill();
    }

    // this.window.getContext().fillStyle = this.timeManager.colorHEX;
    // this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());

    // let gradient = this.window.getContext().createLinearGradient(startX, startY, this.sizeXFunc() + startX, startY);
    // let steps = this.steps;
    // for (let i = 0; i <= steps; i++) {
    //     let frac = i / steps;
    //     gradient.addColorStop(frac, hsvToHex(frac * 360, 1, 1))
    // }
    // this.window.getContext().fillStyle = gradient;
    // this.window.getContext().fillRect(startX, startY, this.sizeXFunc(), this.sizeYFunc());

    // let blockSize = this.sizeY;
    // let invlerp = (loadGD(this.key) - this.min) / (this.max - this.min);
    // let lerp = invlerp * this.sizeX;
    // let lineWidth = getBaseUISize() * 0.1;
    // this.window.getContext().strokeStyle = COLOR_BLACK;        // set the color for the circle to 'green'
    // this.window.getContext().lineWidth = lineWidth;

    // this.window.getContext().strokeRect((startX + lineWidth /2) + lerp - (blockSize / 2), startY + (lineWidth / 2), blockSize - lineWidth, this.sizeY - (lineWidth));

    // return [this.sizeX, this.sizeY]
}
