import { randRange } from "../../../common.js";
import { UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER } from "../../../ui/UIData.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { OrganismGeneticCode } from "../../genetics/OrganismGeneticCode.js";
import { BaseLeafNodeFlower } from "./BaseLeafNodeFlower.js";

export class SunflowerLeafNodeFlower extends BaseLeafNodeFlower {
    constructor(square, parentId) {
        super(square, parentId)
        this.proto = "SunflowerLeafNodeFlower";
        this.uiRef = UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER;

        this.maxNumStem = 1;
        this.maxStemLength = 14;
        this.maxLeafStemLength = 4;
        this.maxLeafLength = 3;
        this.maxFlowerLength = 6;
        this.numPetals = 36;

        this.stemLsqHeight = 1;
        this.leafStemLsqHeight = 1;
        this.leafLsqHeight = 0.6;
        this.leafStemDy = 0.7;
        this.leafDy = 1;

        this.colorLeaf = [56, 63, 19];
        this.colorStem = [46, 53, 16];
        this.colorStemFlowerBase = [21, 26, 6];

        this.flowerColorC = [25, 24, 24];
        this.flowerColorR1 = [36, 21, 15];
        this.flowerColorR2 = [131, 112, 26];
        this.flowerColorR3 = [167, 143, 41];
        this.flowerColorR4 = [180, 159, 66];

        this.flowerColor = [
            this.flowerColorC,
            this.flowerColorR1,
            this.flowerColorR1,
            this.flowerColorR4,
            this.flowerColorR3,
            this.flowerColorR3,
            this.flowerColorR4,
            this.flowerColorR3
        ]
    }

    processGenetics() {
        super.processGenetics();
        this.maxStemLength = randRange(24, 56)
    }

    getSeedType() {
        return SunflowerLeafNodeFlowerSeedOrganism;
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