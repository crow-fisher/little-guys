import { getBaseUISize } from "../../canvas.js";
import { rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getDefaultLightingArr } from "../../lighting/lightingProcessing.js";
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
        return;
    }

    render(startX, startY) {
        this.numRows = 6; // eg, flower petal length
        this.numCols = 25; // eg, num flower petals

        this.rh = this.sizeY / this.numRows;
        this.rw = this.sizeX / this.numCols;

        let cmap = this.refOrgFunc()[this.orgAttribute];
        let dl = getDefaultLightingArr(), c = new Array(4);

        for (let i = 0; i < this.numRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                multiplyVectorsMultDest(dl, cmap[i][j % cmap[i].length], 0.9, c);
                MAIN_CONTEXT.fillStyle = rgbToRgba(...c);
                MAIN_CONTEXT.fillRect(startX + (this.rw * j), (startY + this.rh * i), this.rw, this.rh)
            }
            MAIN_CONTEXT.fillStyle = "#000000";
            MAIN_CONTEXT.fillRect(Math.floor(startX + (this.rw * cmap[i].length)), (startY + this.rh * i), Math.floor(getBaseUISize() * .5), this.rh);
        }
        return [this.sizeX, this.sizeY];
    }
}