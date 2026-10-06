import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags";
import { compositeSoupKey } from "./enum/soupEnum";

export class OrganismGeneticCode {
    constructor(specifier) {
        this.valueScale = 10 ** 5;
        this.code = new Array();
        this.code.push(compositeSoupKey(SKF_ORIGIN, specifier));
    }
    addTag(keyFlag, keySpecifier) {
        this.code.append(compositeSoupKey(keyFlag, keySpecifier));
    }
    addTagIndex(keyFlag, keySpecifier, index) {
        this.code.append(compositeSoupKey(keyFlag, keySpecifier | index));
    }
    addTagIndexValue(keyFlag, keySpecifier, index, value) {
        this.code.append(compositeSoupKey(keyFlag, keySpecifier | index));
        this.code.append(this.numberToIntValue(value));
    }
    numberToIntValue(val) {
        return Math.floor(val * this.valueScale);
    }
    intValueToNumber(intValue) {
        return intValue / this.valueScale;
    }


}

