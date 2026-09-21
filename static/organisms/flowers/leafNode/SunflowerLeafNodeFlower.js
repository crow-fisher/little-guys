import { randRange } from "../../../common.js";
import { UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER } from "../../../ui/UIData.js";
import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { BaseLeafNodeFlower } from "./BaseLeafNodeFlower.js";

export class SunflowerLeafNodeFlower extends BaseLeafNodeFlower {
    constructor(square, parentId) {
        super(square, parentId)
        this.proto = "SunflowerLeafNodeFlower";
        this.uiRef = UI_ORGANISM_FLOWER_LEAFNODE_SUNFLOWER;

        this.maxNumStem = 1;
        this.maxStemLength = 14;
        this.maxLeafStemLength = 5;
        this.maxLeafLength = 3;
        this.maxFlowerLength = 5;
        this.numPetals = 25;

        this.leafStemDy = 0.7;
        this.leafDy = 0.8;

        this.colorLeaf = [56, 63, 19];
        this.colorStem = [46, 53, 16];
        this.colorStemFlowerBase = [21, 26, 6];

        this.flowerColorC = [25, 24, 24];
        this.flowerColorR1 = [36, 21, 15];
        this.flowerColorR2 = [117, 111, 23];
        this.flowerColorR3 = [167, 143, 41];

        this.flowerR1D = 0.3;
        this.flowerR2D = .7;
        this.flowerR3D = .8;
        this.flowerR4D = 1;

        this.flowerR1W = 0.9;
        this.flowerR2W = 0.9;
        this.flowerR3W = 0.9;
        this.flowerR4W = 0.5;
        this.flowerR5W = 0.1;

        this.flowerR1H = 0.30;
        this.flowerR2H = 0.70;
        this.flowerR3H = 0.70;
        this.flowerR4H = 0.90;
    }

    getSeedType() {
        return SunflowerLeafNodeFlowerSeedOrganism;
    }

    leafShapeFunc(x) {
        return Math.sin(Math.PI * x - 5) + 1.2 * x - .2;
    }

    prepareStemGrowthPlanParams() {
        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = randRange(-.1, .1);
        this.stemBaseCurve = randRange(-.05, .05);
        this.stemStrengthMult = .35;
        this.stemRollingAveragePeriod = 150;

        this.stemTwist = 0;
        this.stemBaseRotation = 0;
        this.stemBaseDeflection = 0;
        this.stemBaseCurve = -.2
    }

    prepareLeafStemGrowthParams(side) {
        this.leafStemTwist = 0;
        this.leafStemBaseRotation = 0;
        this.leafStemBaseDeflection = 0;
        this.leafStemBaseCurve = 1;

        this.leafStemStrengthMult = .35;
        this.leafStemRollingAveragePeriod = 150;
    }

    prepareLeafGrowthParams(side) {
        this.leafTwist = Math.PI;
        this.leafBaseRotation = 1;
        this.leafBaseDeflection = 1
        this.leafBaseCurve = 0;

        this.leafStrengthMult = .35;
        this.leafRollingAveragePeriod = 150;
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