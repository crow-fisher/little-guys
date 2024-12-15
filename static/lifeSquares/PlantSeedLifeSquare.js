class PlantSeedLifeSquare extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantSeedLifeSquare";
        this.type = "seed";
        this.sproutStatus = 0;
        this.sproutGrowthRate = p_seed_ls_sproutGrowthRate;
        this.p_seed_ls_neighborWaterContainmentRequiredToGrow = p_seed_ls_neighborWaterContainmentRequiredToGrow;
        this.neighborWaterContainmentRequiredToDecay = p_seed_ls_neighborWaterContainmentRequiredToDecay;
        this.colorBase = "#A1CCA5";
    }

    tick() {
        var hostSquareArr = Array.from(getSquares(this.posX, this.posY).filter((sq) => sq.collision && sq.rootable));
        if (hostSquareArr.length == 0) {
            console.error("No collidable and rootable host square found!");
            return;
        }
        var hostSquare = hostSquareArr[0];
        var directNeighbors = getNeighbors(this.posX, this.posY);

        var totalSurroundingWater = hostSquare.waterContainment;
        for (var i = 0; i < directNeighbors.length; i++) {
            var neighbor = directNeighbors[i];
            if (neighbor == null) {
                continue;
            }
            if (!neighbor.solid) { // basically if it's a water type?? idk maybe this is unclear
                totalSurroundingWater += neighbor.blockHealth;
                continue;
            }
            totalSurroundingWater += neighbor.waterContainment;
        }

        if (totalSurroundingWater < this.neighborWaterContainmentRequiredToDecay.value) {
            this.sproutStatus -= this.sproutGrowthRate.value;
        }
        if (totalSurroundingWater > this.p_seed_ls_neighborWaterContainmentRequiredToGrow.value) {
            this.sproutStatus += this.sproutGrowthRate.value;
        }

        this.sproutStatus = Math.max(0, this.sproutStatus);
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = p_seed_ls_darkeningStrength.value;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.

        var num = this.sproutStatus;
        var numMax = 1;

        var featureColor255 = (1 - (num / numMax)) * 255;
        var darkeningColorRGB = { r: featureColor255, b: featureColor255, g: featureColor255 };

        ['r', 'g', 'b'].forEach((p) => {
            darkeningColorRGB[p] *= darkeningStrength;
            baseColorRGB[p] *= (1 - darkeningStrength);
        });

        var resColor = {
            r: darkeningColorRGB.r + baseColorRGB.r,
            g: darkeningColorRGB.g + baseColorRGB.g,
            b: darkeningColorRGB.b + baseColorRGB.b
        }

        return rgbToHex(Math.floor(resColor.r), Math.floor(resColor.g), Math.floor(resColor.b));
    }


}
