import { SKF_ORIGIN } from "./enum/namespace/vanilla/keyFlags";
import { compositeSoupKey } from "./enum/soupEnum";

export class OrganismGeneticCode {
    constructor(specifier) {
        this.code = new Array();
        this.code.push(compositeSoupKey(SKF_ORIGIN, specifier));

    }
    addTag(keyFlag, keySpecifier) {
        this.code.append(compositeSoupKey(keyFlag, keySpecifier));
    }
}

