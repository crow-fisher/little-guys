import { UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER } from "../../../ui/UIData.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { BaseLeafNodeFlower } from "./BaseLeafNodeFlower.js";

export class SunflowerLeafNodeFlower extends BaseLeafNodeFlower {
    constructor(square, parentId) {
        super(square, parentId)
        this.proto = "SunflowerLeafNodeFlower";
        this.uiRef = UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER
    }
}

export class SunflowerLeafNodeFlowerSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, parentId) {
        super(square, evolutionParameters, parentId);
        this.proto = "SunflowerLeafNodeFlowerSeedOrganism";

    }

    getSproutType() {
        return SunflowerLeafNodeFlower;
    }
    getSproutTypeProto() {
        return "SunflowerLeafNodeFlower";
    }
}