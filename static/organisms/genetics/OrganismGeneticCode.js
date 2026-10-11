import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags.js";
import { compositeSoupKey } from "./enum/soupEnum.js";

export class OrganismGeneticCode {
    constructor(specifier) {
        this.valueScale = 10 ** 5;
        this.code = new Array();
        this.code.push(compositeSoupKey(SKF_ORIGIN, specifier));
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
        return this.code.map((val) => val.toString(36)).reduce((a, b) => a + "|" + b, "");
    }

}

