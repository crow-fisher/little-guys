import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { TropicalGrassOrganism } from "./TropicalGrassOrganism.js";

export class TropicalGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "TropicalGrassSeedOrganism";
    }
    getSproutType() {
        return TropicalGrassOrganism;
    }
}