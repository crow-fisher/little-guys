import { getActiveClimate } from "../../climate/climateManager.js";
import { COLOR_BLACK, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { rgbToHex } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_PALETTE_COMPOSITION, UI_PALETTE_ROCKIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_SOILIDX } from "../UIData.js";
import { WindowElement } from "../Window.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class SoilPickerElement extends WindowElement {
    constructor(window, key, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.key = key;
        this.pickerSize = Math.min(sizeX, sizeY);
        this.hoverColor = {r: 100, g: 100, b: 100};
        this.clickColor = {r: 100, g: 100, b: 100};
        this.hoverLoc = null;

        this.colorCache = new Map();
        this.colorCache[true] = new Map(); // rockmode
        this.colorCache[false] = new Map();

        this.blockSize = 4.99999;

    }

    render(startX, startY) {
        for (let i = 0; i <= this.pickerSize; i += this.blockSize) {
            for (let j = 0; j <= this.pickerSize; j += this.blockSize) {
                let rowXOffset = ((j / this.blockSize) % 2) * (this.blockSize / 2)
                this.renderSingleSquare(startX, startY, i + rowXOffset, j);
            }
        }

        let loc = this.derivePosition(...loadGD(UI_PALETTE_COMPOSITION));
        MAIN_CONTEXT.fillStyle = "#FFFFFF";
        MAIN_CONTEXT.fillRect(startX + loc[0] - 2, startY + loc[1] - 2, 4, 4);

        if (this.hoverLoc != null) {
            MAIN_CONTEXT.fillStyle = COLOR_BLACK;
            MAIN_CONTEXT.fillRect(startX + this.hoverLoc[0] - 2, startY + this.hoverLoc[1] - 2, 4, 4);
        }

        let colorSize = (this.sizeX - this.pickerSize) / 2;

        MAIN_CONTEXT.fillStyle = rgbToHex(this.hoverColor.r, this.hoverColor.g, this.hoverColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize, startY, colorSize, this.sizeY);
        MAIN_CONTEXT.fillStyle = rgbToHex(this.clickColor.r, this.clickColor.g, this.clickColor.b);
        MAIN_CONTEXT.fillRect(startX + this.pickerSize + colorSize, startY, colorSize, this.sizeY);
        return [this.sizeX, this.sizeY]
    }

    getSquareComposition(i, j) {
        let xp = i / this.pickerSize;
        let yp = j / this.pickerSize;
        let clayPercent = 1 - yp;
        
        let xp50 = (0.5 - xp);
        if (2 * (Math.abs(xp50)) >= 1 - clayPercent) {
            return;
        }

        let siltPercent = (1 - clayPercent) * xp;
        let sandPercent = (1 - clayPercent) - siltPercent;

        return [sandPercent, siltPercent, clayPercent];
    }

    getBaseColor(sand, silt, clay) {
        return getActiveClimate().getBaseColorActiveToolActivePalette([sand, silt, clay]);
    }

    getSquareColor(i, j) {
        let cacheMap = this.colorCache[loadGD(UI_PALETTE_ROCKMODE)];
        let cacheMapIdx = loadGD(loadGD(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX);
        if (cacheMap[cacheMapIdx] == null) {
            cacheMap[cacheMapIdx] = new Map();
        }

        if (cacheMap[cacheMapIdx][i] == null) {
            cacheMap[cacheMapIdx][i] = new Map();
        }
        let cached = cacheMap[cacheMapIdx][i][j];
        if (cached != null) {
            return cached;
        }
        let arr = this.getSquareComposition(i, j);
        if (arr != null)
            cacheMap[cacheMapIdx][i][j] = this.getBaseColor(arr[0], arr[1], arr[2]);
            return cacheMap[cacheMapIdx][i][j]
    }

    renderSingleSquare(startX, startY, i, j) {
        let colorRGB = this.getSquareColor(i, j);
        if (colorRGB != null) {
            MAIN_CONTEXT.fillStyle = rgbToHex(colorRGB.r, colorRGB.g, colorRGB.b);
            MAIN_CONTEXT.beginPath();
            let scale = this.blockSize * 1.2;
            let a1 = [-0.866 * scale, 0.5 * scale]
            let a2 = [0.866 * scale, 0.5 * scale]
            let a3 = [0.0 * scale, -1.0 * scale]

            MAIN_CONTEXT.moveTo(startX + i + a1[0], startY + j + a1[1]);
            MAIN_CONTEXT.lineTo(startX + i + a2[0], startY + j + a2[1]);
            MAIN_CONTEXT.lineTo(startX + i + a3[0], startY + j + a3[1]);
            MAIN_CONTEXT.lineTo(startX + i + a1[0], startY + j + a1[1]);
            MAIN_CONTEXT.fill();
            
            // MAIN_CONTEXT.fillRect(startX + i, startY + j, this.blockSize + 1, this.blockSize + 1);
        }
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        let c = this.getSquareColor(posX, posY);
        if (c != null) {
            this.hoverColor = c;
            if (isLeftMouseClicked()) {
                this.window.locked = true;
                this.clickColor = c;
                this.clickLoc = [posX, posY];
                saveGD(this.key, this.getSquareComposition(posX, posY))
            } else {
                this.hoverLoc = [posX, posY];
            }
        }
    }
    derivePosition(sand, silt, clay) {
        let y = 1 - clay;
        let x = silt / (silt + sand);
        return [x * this.pickerSize, y * this.pickerSize];
    }
    setHover(sand, silt, clay) {
        this.hoverLoc = this.derivePosition(sand, silt, clay);
        this.hoverColor = this.getBaseColor(sand, silt, clay);
    }
    setClick(sand, silt, clay) {
        saveGD(this.key, [sand, silt, clay]);
    }
}
