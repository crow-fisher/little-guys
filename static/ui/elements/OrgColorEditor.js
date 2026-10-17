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
        this.sx = clamp(Math.floor(posX / this.rw), 0, this.numCols - 1);
        this.sy = clamp(Math.floor(posY / this.rh), 0, this.numRows - 1);

        if (isLeftMouseClicked() || isRightMouseClicked()) {
            if (this.sx >= this.cmap[this.sy].length) {
                for (let i = this.cmap[this.sy].length; i < this.sx; i++) {
                    this.cmap[this.sy][i] = this.cmap[this.sy][i % this.cmap[this.sy].length];
                }
            }
        }

        if (isRightMouseClicked()) {
            console.log(this.cmap[this.sy])
            this.cmap[this.sy].length = Math.min(this.cmap[this.sy].length, this.sx);
            console.log(this.cmap[this.sy])
        }

        console.log(this.sx, this.sy);
    }

    render(startX, startY) {
        this.cmap = this.refOrgFunc()[this.orgAttribute];
        let dl = getDefaultLightingArr(), c = new Array(4);

        this.numRows = this.refOrgFunc().maxFlowerPetalLength;
        this.numCols = this.refOrgFunc().numPetals;
    
        this.rh = Math.floor(this.sizeY / this.numRows);
        this.rw = Math.ceil(this.sizeX / this.numCols);

        let lw1 = Math.floor(getBaseUISize() * 0.25);
        let lw2 = Math.floor(getBaseUISize() * 0.125);
        let lw4 = Math.floor(getBaseUISize() * 0.0625);

        for (let i = 0; i < this.numRows; i++) { // layer 0
            for (let j = 0; j < this.numCols; j++) {
                multiplyVectorsMultDest(dl, this.cmap[i][j % this.cmap[i].length], 0.9, c);
                MAIN_CONTEXT.fillStyle = rgbToRgba(...c);
                MAIN_CONTEXT.fillRect(startX + (this.rw * j), (startY + this.rh * i), this.rw, this.rh)
            }
        }

        for (let i = 0; i < this.numRows; i++) { // layer 1
            for (let j = 0; j < this.numCols; j++) {



                if (this.cmap[i].length == j) {
                    MAIN_CONTEXT.fillStyle = "rgba(197, 197, 197, 0.6)";
                } else {
                    MAIN_CONTEXT.fillStyle = "rgba(40, 40, 40, 0.2)";
                }
                MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * (j + 1))) - lw1, (startY + this.rh * i), lw1, this.rh);

                MAIN_CONTEXT.fillStyle = "#000000";
                let selected = (this.sx == j && this.sy == i);
                if (selected) {
                    MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * j)), (startY + this.rh * i), lw1, this.rh);

                    if (!(this.cmap[i].length == j))
                    MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * (j + 1))) - lw1, (startY + this.rh * i), lw1, this.rh);

                    MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * j)), (startY + this.rh * i), this.rw, lw1);
                    MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * j)), (startY + this.rh * (i + 1)) - lw1, this.rw, lw1);

                }

                
            }
        }
        return [this.sizeX, this.sizeY];
    }
}