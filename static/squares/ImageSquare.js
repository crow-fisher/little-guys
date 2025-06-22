import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { rgbToRgba } from "../common.js";
import { isGroupGrounded } from "../globals.js";
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
        let outColor = structuredClone(this.colorBase);
        let darkeningColorMult = (this.waterContainment / this.waterContainmentMax);

        outColor.r *= (1 - 0.24 * darkeningColorMult);
        outColor.g *= (1 - 0.30 * darkeningColorMult);
        outColor.b *= (1 - 0.383 * darkeningColorMult);
        return outColor;
    }
   
}

export class RigidImageSquare extends ImageSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY, r, g, b, a);
        this.proto = "RigidImageSquare";
        this.rootable = false;
        
    }
    slopePhysics() {}
}

export class StaticImageSquare extends ImageSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY, r, g, b, a);
        this.proto = "StaticImageSquare";
        this.physicsEnabled = false;
        this.rootable = false;
    }
    physics() {}
}


export class BackgroundImageSquare extends StaticImageSquare {
    constructor(posX, posY, r, g, b, a) {
        super(posX, posY, r, g, b, a);
        this.proto = "BackgroundImageSquare";
        this.collision = false;
    }

    getLightFilterRate() {
        return 0;
    }

    
}
