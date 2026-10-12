import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags.js";
import { compositeSoupKey } from "./enum/soupEnum.js";

export const SEP = "|";

export class OrganismGeneticCode {
    constructor(sourceString) {
        this.valueScale = 10 ** 5;
        this.radix = 10;
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

}

