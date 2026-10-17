import { getBaseUISize } from "../../canvas.js";
import { clamp, rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getDefaultLightingArr } from "../../lighting/lightingProcessing.js";
import { isLeftMouseClicked, isRightMouseClicked } from "../../mouse.js";
import { multiplyVectorsMultDest } from "../../util/vector.js";
import { WindowElement } from "../Window.js";

export class OrgColorEditor extends WindowElement {
    constructor(window, sizeX, sizeY, refOrgFunc, orgAttribute) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.refOrgFunc = refOrgFunc;
        this.orgAttribute = orgAttribute;
    }

    hover(posX, posY) {
        let sx = clamp(Math.floor(posX / this.rw), 0, this.numCols);
        let sy = clamp(Math.floor(posY / this.rh), 0, this.numRows);

        if (isLeftMouseClicked()) {
            if (sx >= this.cmap[sy].length) {
                for (let i = this.cmap[sy].length; i < sx; i++) {
                    this.cmap[sy][i] = this.cmap[sy][i % this.cmap[sy].length];
                }
            }
        }

        if (isRightMouseClicked()) {
            console.log(this.cmap[sy])
            this.cmap[sy].length = Math.min(this.cmap[sy].length, sx);
            console.log(this.cmap[sy])
        }

        console.log(sx, sy);
    }

    render(startX, startY) {
        this.cmap = this.refOrgFunc()[this.orgAttribute];
        let dl = getDefaultLightingArr(), c = new Array(4);

        this.numRows = 6; // eg, flower petal length
        this.numCols = 25; // eg, num flower petals

        this.rh = this.sizeY / this.numRows;
        this.rw = this.sizeX / this.numCols;

        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                multiplyVectorsMultDest(dl, this.cmap[i][j % this.cmap[i].length], 0.9, c);
                MAIN_CONTEXT.fillStyle = rgbToRgba(...c);
                MAIN_CONTEXT.fillRect(startX + (this.rw * j), (startY + this.rh * i), this.rw, this.rh)

                MAIN_CONTEXT.fillStyle = "#222222";
                MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * j)), (startY + this.rh * i), Math.floor(getBaseUISize() * .125), this.rh);

            }
            MAIN_CONTEXT.fillStyle = "#000000";
            MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * this.cmap[i].length)), (startY + this.rh * i), Math.floor(getBaseUISize() * .25), this.rh);
        }
        return [this.sizeX, this.sizeY];
    }
}