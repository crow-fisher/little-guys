import { clamp } from "../../common.js";
import { copyVecValue } from "../../util/vector.js";
import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags.js";
import { compositeSoupKey } from "./enum/soupEnum.js";

export const SEP = "|";

export class OrganismGeneticCode {
    constructor(sourceString) {
        this.valueScale = 10 ** 5;
        this.radix = 36;
        this.code = (sourceString == null || sourceString == -1) ? new Array() : Array.from(sourceString.split(SEP).map((v) => Number.parseInt(v, this.radix)));
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
    
    addRgbaValue(r, g, b, a) {
        this.code.push(this.rgbafToSoup(r, g, b, a))
    }

    popRgbaValue(i) {
        return this.soupToRgba(this.code.at(i));
    }

    rgbafToSoup(r, g, b, a, out=0) { 
      r = Math.round(r), g = Math.round(g), b = Math.round(b), a = Math.round(a * (2 ** 8) - 1);
      out += Math.abs(a);
      out += b << 8;
      out += g << 16;
      out += r << 24;
      return out;
    }

    soupToRgba(soup) {
    let a = (soup >> 0) & (2 ** 8 - 1)
    let r = (soup >> 24) & ((2 ** 8) - 1) 
    let g = (soup >> 16) & ((2 ** 8) - 1) 
    let b = (soup >> 8) & ((2 ** 8) - 1) 
    return [r, g, b, a / (2 ** 8)];
    }

}

