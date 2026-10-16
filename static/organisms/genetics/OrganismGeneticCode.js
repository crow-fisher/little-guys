import { clamp } from "../../common.js";
import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags.js";
import { compositeSoupKey } from "./enum/soupEnum.js";

export const SEP = "|";

export class OrganismGeneticCode {
    constructor(sourceString) {
        this.valueScale = 10 ** 5;
        this.radix = 36;
        this.code = sourceString == null ? new Array() : Array.from(sourceString.split(SEP).map((v) => Number.parseInt(v, this.radix)));
    }

    addTag(keyFlag, keySpecifier) {
        this.code.push(compositeSoupKey(keyFlag, keySpecifier));
    }
    addTagIndex(keyFlag, keySpecifier, index) {
        this.code.push(compositeSoupKey(keyFlag, keySpecifier | index));
    }
    addTagIndexValue(keyFlag, keySpecifier, index, value) {
        this.code.push(compositeSoupKey(keyFlag, keySpecifier | index));
        this.code.push(this.numberToIntValue(value));
    }
    numberToIntValue(val) {
        return Math.floor(val * this.valueScale);
    }
    intValueToNumber(intValue) {
        return intValue / this.valueScale;
    }
    serialize() {
        return this.code.map((val) => val.toString(this.radix)).reduce((a, b) => a + (a == "" ? '' : SEP) + b, "");
    }
    
    addRgbafValue(r, g, b, a, f) {
        this.code.push(this.rgbafToSoup(r, g, b, a, f))
    }

    rgbafToSoup(r, g, b, a, f, out=0) { 
      r = Math.round(r), g = Math.round(g), b = Math.round(b), a = Math.round(a * (2 ** 7 ) - 1);
      out += a;
      out += b << 7;
      out += g << 15;
      out += r << 23;
      out += f << 31;
      return out;
    }

    soupToRgbaf(soup) {
    let f = -(soup >> 31);
    let a = (soup >> 0) & (2 ** 7 - 1)
    let r = (soup >> 23) & ((2 ** 8) - 1) 
    let g = (soup >> 15) & ((2 ** 8) - 1) 
    let b = (soup >> 7) & ((2 ** 8) - 1) 
    return [r, g, b, a, f];
    }

}

