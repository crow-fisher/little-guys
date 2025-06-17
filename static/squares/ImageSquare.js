import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { rgbToRgba } from "../common.js";
import { MAIN_CONTEXT } from "../index.js";
import { BaseSquare } from "./BaseSqaure.js";
import { RockSquare } from "./parameterized/RockSquare.js";
import { SoilSquare } from "./parameterized/SoilSquare.js";

export class ImageSquare extends SoilSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY);
        this.proto = "ImageSquare";
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.color = rgbToRgba(r, g, b, a);
        this.cachedRgba = this.color;
        this.sand = 0.333;
        this.silt = 0.333;
        this.clay = 1 - (this.sand + this.silt);
        this.colorBase = {r: r, g: g, b: b, a: a}
    }

    getColorBase() {
        return this.colorBase;
    }
    renderWithVariedColors2() {
        MAIN_CONTEXT.fillStyle = this.color;
        zoomCanvasFillRect(
            (this.offsetX + this.posX) * getBaseSize(),
            (this.offsetY + this.posY) * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }
}

export class StaticImageSquare extends ImageSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY, r, g, b, a);
        this.proto = "StaticImageSquare";
        this.physicsEnabled = false;
    }
}


export class BackgroundImageSquare extends StaticImageSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY, r, g, b, a);
        this.proto = "BackgroundImageSquare";
        this.collision = false;
    }
}
