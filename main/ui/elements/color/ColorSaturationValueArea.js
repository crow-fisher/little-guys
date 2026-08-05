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

        let nH = 20; // numHorizontalSubdivisions; 
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

            _p1[0] = Math.round(_p1[0]);
            _p1[1] = Math.round(_p1[1]);
            _p2[0] = Math.round(_p2[0]);
            _p2[1] = Math.round(_p2[1]);
            _p3[0] = Math.round(_p3[0]);
            _p3[1] = Math.round(_p3[1]);
            _p4[0] = Math.round(_p4[0]);
            _p4[1] = Math.round(_p4[1]);

            let gradient = this.window.getContext().createLinearGradient(..._p1, ..._p3);

            gradient.addColorStop(0, hsvToHex(this.colorConfig.h, i / nH, 1));
            gradient.addColorStop(1, hsvToHex(this.colorConfig.h, (i + 1) / nH, 0));

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
            this.window.getContext().beginPath()

        this.window.getContext().fillStyle = "#000000";
        this.window.getContext().arc(
            lerp(p1[0], p3[0], 1 - this.colorConfig.s),
            lerp(p1[1], p3[1], this.colorConfig.v),
            4, 0, 2 * Math.PI, false);
        this.window.getContext().fill();
    }
}
