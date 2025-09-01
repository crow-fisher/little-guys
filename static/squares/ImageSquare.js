import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { rgbToRgba } from "../common.js";
import { getNextGroupId, isGroupGrounded } from "../globals.js";
import { MAIN_CONTEXT } from "../index.js";
import { applyLightingFromSource } from "../lighting/lightingProcessing.js";
import { addSquare } from "./_sqOperations.js";
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

    spawnParticle(dx, dy, sx, sy, amount) {
        let sq = new ImageSquare(this.posX + dx, this.posY + dy, this.r, this.g, this.b, this.a);
        if (addSquare(sq)) {
            sq.waterContainment = this.waterContainment;
            sq.blockHealth = amount;
            this.blockHealth -= amount;
            applyLightingFromSource(this, sq);
            sq.speedX += sx;
            sq.speedY += sy;
            sq.group = getNextGroupId();
            return amount;
        }
        return 0;
    }

    consumeParticle(incomingSq) {
        if (this.blockHealth <= 0 || incomingSq.blockHealth <= 0)
            return null;

        let res = super.consumeParticle(incomingSq);
        this.r = (this.r * res[1] + res[2] * incomingSq.r) / this.blockHealth;     
        this.g = (this.g * res[1] + res[2] * incomingSq.g) / this.blockHealth;
        this.b = (this.b * res[1] + res[2] * incomingSq.b) / this.blockHealth;
        return res;
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
