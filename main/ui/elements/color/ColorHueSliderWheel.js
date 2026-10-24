import { hsvToHex } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../_index.js";
import { tau } from "../../../util/const.js";
import { WindowElement } from "../../Window.js";

export class ColorHueSliderWheel extends WindowElement {
    constructor(window, sizeX, sizeY, steps = 50) {
        super(window, sizeX, sizeY);
        this.steps = steps;
    }

    size() {
        return [this.sizeX, 0];
    }

    render(startX, startY) {
        let midpoint = [startX, startY];
        midpoint[0] += this.sizeX / 2;
        midpoint[1] += this.sizeY / 2;

        let p1 = [0, 0];
        let p2 = [0, 0];
        let p3 = [0, 0];
        let p4 = [0, 0];

        for (let i = 0; i < this.steps; i++) {
            p1[0] = midpoint[0] + (this.sizeX / 2.5) * Math.cos(tau * (i / this.steps));
            p1[1] = midpoint[1] + (this.sizeY / 2.5) * Math.sin(tau * (i / this.steps));

            p2[0] = midpoint[0] + (this.sizeX / 2) * Math.cos(tau * (i / this.steps));
            p2[1] = midpoint[1] + (this.sizeY / 2) * Math.sin(tau * (i / this.steps));

            p3[0] = midpoint[0] + (this.sizeX / 2) * Math.cos(tau * ((i + 1) / this.steps));
            p3[1] = midpoint[1] + (this.sizeY / 2) * Math.sin(tau * ((i + 1) / this.steps));

            p4[0] = midpoint[0] + (this.sizeX / 2.5) * Math.cos(tau * ((i + 1) / this.steps));
            p4[1] = midpoint[1] + (this.sizeY / 2.5) * Math.sin(tau * ((i + 1) / this.steps));

            p1[0] = Math.round(p1[0]);
            p1[1] = Math.round(p1[1]);
            p2[0] = Math.round(p2[0]);
            p2[1] = Math.round(p2[1]);
            p3[0] = Math.round(p3[0]);
            p3[1] = Math.round(p3[1]);
            p4[0] = Math.round(p4[0]);
            p4[1] = Math.round(p4[1]);

            let gradient = MAIN_CONTEXT.createLinearGradient(...p1, ...p4);

            gradient.addColorStop(0, hsvToHex((i / this.steps) * 360, 1, 1));
            gradient.addColorStop(1, hsvToHex(((i + 1) / this.steps) * 360, 1, 1));

            MAIN_CONTEXT.fillStyle = gradient;
            MAIN_CONTEXT.beginPath()
            MAIN_CONTEXT.moveTo(...p1);
            MAIN_CONTEXT.lineTo(...p2)
            MAIN_CONTEXT.lineTo(...p3)
            MAIN_CONTEXT.lineTo(...p4)
            MAIN_CONTEXT.lineTo(...p1)
            MAIN_CONTEXT.closePath();
            MAIN_CONTEXT.fill();
        }

        // p1 = [0, 0];
        // p2 = [0, 0];

        //MAIN_CONTEXT.beginPath()
        //MAIN_CONTEXT.fillStyle = "#000000";
        //MAIN_CONTEXT.moveTo(...p1);
        //MAIN_CONTEXT.lineTo(...p2)
        //MAIN_CONTEXT.closePath();
        //MAIN_CONTEXT.fill();
    }

    interact(posX, posY) {
        let midpoint = [startX, startY];
        midpoint[0] += this.sizeX / 2;
        midpoint[1] += this.sizeY / 2;

        console.log(midpoint);

    }

}