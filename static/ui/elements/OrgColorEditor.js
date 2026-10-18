import { getBaseUISize } from "../../canvas.js";
import { clamp, invlerp, rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getDefaultLightingArr } from "../../lighting/lightingProcessing.js";
import { isLeftMouseClicked, isRightMouseClicked } from "../../mouse.js";
import { loadEmptyScene } from "../../saveAndLoad.js";
import { addTwoVec3Dest, addVec3Mult, addVec4Mult, getVec2Length, multiplyVectorByScalar, multiplyVectorsMultDest } from "../../util/vector.js";
import { loadGD, UI_COLORPICKER_CONFIG } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class OrgColorEditor extends WindowElement {
    constructor(window, sizeX, sizeY, refOrgFunc, orgAttribute) {
        super(window, sizeX, sizeY);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.refOrgFunc = refOrgFunc;
        this.orgAttribute = orgAttribute;
        this.reinitOrg = true;
    }

    hover(posX, posY) {
        let cs = loadGD(UI_COLORPICKER_CONFIG);


        if (this.reinitOrg) {
            this.reinitOrg = false;
            for (let i = 0; i < this.numCols; i++) {
                for (let j = 0; j < this.numRows; j++) {
                    this.cmap[j][i] = this.cmap[j][i] ?? structuredClone(this.cmap[j][i - 1]);
                }
            }

        }

        if (isLeftMouseClicked()) {
            this.window.locked = true;
            for (let i = 0; i < this.numRows; i++) {
                for (let j = 0; j < this.numCols; j++) {
                    let dy = (i * this.rh) - posY;
                    let dx = (j * this.rw) - posX;

                    let l = dx ** 2 + dy ** 2;

                    if (l > 3000) {
                        continue;
                    }

                    let min = 30;
                    let max = 300;
                    l = clamp(min, max, l);
                    let intensity = 0.4 * (1 - invlerp(min, max, l));
                    multiplyVectorByScalar(this.cmap[i][j], 1 - intensity);
                    addVec4Mult(this.cmap[i][j], cs.rgbaArr, intensity * 255);
                }
            }

        }
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
        return [this.sizeX, this.sizeY];
    }
}