import { hsvToHex, hsvToRgba, rgbToHex } from "../../../color/color.js";
import { lerp, randRange } from "../../../common.js";
import { tau } from "../../../util/const.js";
import { addVectors } from "../../../util/vector.js";
import { WindowElement } from "../../WindowElement.js";

export class ColorColorHistory extends WindowElement {
    constructor(window, sizeXFunc, sizeYFunc, steps = 50) {
        super(window, sizeXFunc, sizeYFunc); 
        this.colorConfig = this.window.component.config().colorConfig;
        this.uiManager = this.window.component.uiManager;

        this.steps = steps;
        
        this.colorHistory = this.window.component.config().colorConfig.colorHistory;

        if (this.window.component.config().colorConfig.colorHistory.length == 0) {
            this.initColorHistory();
        }

    }

    initColorHistory() {
        let cur = [randRange(0, 360), 0.5, 0.5]

        for (let i = 0; i < 50 * 50; i++) {
            this.colorHistory[i] = structuredClone(cur);
            cur[0] += randRange(0, 5);
            let vd = 0.1;
            cur[1] = 0.8 + 0.2 * Math.sin(i);
            cur[2] = 0.8 + 0.2 * Math.sin(i);
        }
    }

    render(startX, startY) {
        this.rows = 7;
        this.cols = 7;

        let cw = this.sizeXFunc() / this.rows;
        let ch = this.sizeYFunc() / this.cols;

        let cur = 0;
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                this.window.getContext().fillStyle = hsvToHex(...this.colorHistory[cur]);
                this.window.getContext().fillRect(startX + cw * i, startY + ch * j, cw, ch);
                cur++;
            }
        }
    }

    interactClick(posX, posY) {
        let rowX = Math.floor((posX / this.sizeXFunc()) * this.rows);
        let colY = Math.floor((posY / this.sizeXFunc()) * this.cols);
        let cur = 0;
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                if (rowX == i && colY == j) {
                    this.colorConfig.h = this.colorHistory[cur][0];
                    this.colorConfig.s = this.colorHistory[cur][1];
                    this.colorConfig.v = this.colorHistory[cur][2];
                    this.window.component.colorUpdate();
                    break;
                }
                cur++;
            }
        }

    }

}
