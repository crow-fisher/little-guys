import {
    global_plantToRealWaterConversionFactor,
    b_sq_waterContainmentMax,
    b_sq_nutrientValue,
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
    drain_sq_waterContainmentMax,
    drain_sq_waterTransferRate,
    wds_sq_waterContainmentMax,
    wds_sq_waterContainmentTransferRate,
    b_sq_waterContainmentTransferRate,
    b_sq_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
    d_sq_nutrientValue,
    rain_dropChance,
    heavyrain_dropChance,
    rain_dropHealth,
    water_evaporationRate,
    water_viscocity,
    water_darkeningStrength,
    po_airSuckFrac,
    po_waterSuckFrac,
    po_rootSuckFrac,
    po_perFrameCostFracPerSquare,
    po_greenSquareSizeExponentCost,
    po_rootSquareSizeExponentCost,
    p_ls_airNutrientsPerExposedNeighborTick,
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_neighborWaterContainmentRequiredToDecay,
    p_seed_ls_darkeningStrength
    } from "../config/config.js"

export class BaseSquare {
    constructor(posX, posY) {
        this.proto = "BaseSquare";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.colorBase = "#A1A6B4";
        this.solid = true;
        this.spawnedEntityId = 0;
        // block properties - overridden by block type
        this.physicsEnabled = true;
        this.blockHealth = 1; // when reaches zero, delete
        // water flow parameters
        this.waterContainment = 0;
        this.waterContainmentMax = b_sq_waterContainmentMax;
        this.waterContainmentTransferRate = b_sq_waterContainmentTransferRate; // what fraction of ticks does it trigger percolate on
        this.waterContainmentEvaporationRate = b_sq_waterContainmentEvaporationRate; // what fraction of contained water will get reduced per tick
        this.speedX = 0;
        this.speedY = 0;
        this.nutrientValue = b_sq_nutrientValue;
        this.rootable = false;
        this.group = -1;
        this.organic = false;
        this.collision = true;
    };
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }
        this.group = -1;
        this.speedY += 1;
    }
    render() {
        MAIN_CONTEXT.fillStyle = this.calculateColor();
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };

    calculateColor() {
        if (this.waterContainmentMax.value == 0) {
            var baseColorRGB = hexToRgb(this.colorBase);
            return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
        }
        
        var baseColorRGB = hexToRgb(this.colorBase);
        var darkeningStrength = b_sq_darkeningStrength.value;
        // Water Saturation Calculation
        // Apply this effect for 20% of the block's visual value. 
        // As a fraction of 0 to 255, create either perfect white or perfect grey.
        var waterColor255 = (1 - (this.waterContainment / this.waterContainmentMax.value)) * 255;
        var darkeningColorRGB = { r: waterColor255, b: waterColor255, g: waterColor255 };

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
    updatePosition(newPosX, newPosY) {
        if (newPosX == this.posX && newPosY == this.posY) {
            return;
        }
        if (newPosX < 0 || newPosX >= CANVAS_SQUARES_X || newPosY < 0 || newPosY >= CANVAS_SQUARES_Y) {
            removeSquare(this);
            return;
        }
        newPosX = Math.floor(newPosX);
        newPosY = Math.floor(newPosY);

        var error = false;

        getSquares(newPosX, newPosY)
            .filter((sq) => (this.organic && sq.organic) || sq.collision)
            .forEach((sq) => {
                error = true;
            });

        if (error) {
            console.warn("Square not moved; new occupied by a block with collision.");
            return false;
        }

        var newLifeSquares = [];
        var newOrganisms = [];
        
        getOrganismSquaresAtSquare(this.posX, this.posY).forEach((sq) => {
            removeOrganismSquare(sq);
            sq.posX = newPosX;
            sq.posY = newPosY;
            newLifeSquares.push(sq);
        });

        getOrganismsAtSquare(this.posX, this.posY).forEach((org) => {
            removeOrganism(org);
            org.posX = newPosX;
            org.posY = newPosY;
            newOrganisms.push(org);
        });

        removeItemAll(getObjectArrFromMap(ALL_SQUARES, this.posX, this.posY), this);

        this.posX = newPosX;
        this.posY = newPosY;
        getObjectArrFromMap(ALL_SQUARES, this.posX, this.posY).push(this);
        newOrganisms.forEach(addOrganism);
        newLifeSquares.forEach(addOrganismSquare);

        return true;
    }

    calculateGroup() {
        if (this.group != -1) {
            return;
        }
        var groupNeighbors = new Set(getNeighbors(this.posX, this.posY).filter((sq) => sq != null && this.proto == sq.proto));
        groupNeighbors.add(this);
        while (true) {
            var startGroupNeighborsSize = groupNeighbors.size;
            groupNeighbors.forEach((neighbor) => {
                var neighborGroupNeighbors = new Set(getNeighbors(neighbor.posX, neighbor.posY).filter((sq) => sq != null && this.proto == sq.proto));
                neighborGroupNeighbors.forEach((neighborGroupNeighbor) => groupNeighbors.add(neighborGroupNeighbor))
            })
            var endGroupNeighborsSize = groupNeighbors.size;
            if (startGroupNeighborsSize == endGroupNeighborsSize) {
                break;
            }
        }

        var group = Array.from(groupNeighbors).map((x) => x.group).find((x) => x != -1);
        if (group != null) {
            // then we have already set this group, somehow
            // probably some physics shenanigans
            groupNeighbors.forEach((x) => x.group = group);
            this.group = group;
            return;
        }

        var nextGroupId = getNextGroupId();
        groupNeighbors.forEach((x) => x.group = nextGroupId);

    }

    physics() {
        this.evaporateInnerMoisture();
        this.percolateInnerMoisture();

        if (!this.physicsEnabled || getCountOfOrganismsSquaresOfTypeAtPosition(this.posX, this.posY, "root") > 0) {
            return false;
        }
        var finalXPos = this.posX;
        var finalYPos = this.posY;
        var bonked = false;

        for (let i = 1; i < this.speedY + 1; i++) {
            for (let j = 0; j < Math.abs(this.speedX) + 1; j++) {
                var jSigned = (this.speedX > 0) ? j : -j;
                var jSignedMinusOne = (this.speedX == 0 ? 0 : (this.speedX > 0) ? (j - 1) : -(j - 1));
                getSquares(this.posX + jSigned, this.posY + i)
                .filter((sq) => (this.organic && sq.organic) || sq.collision)
                .forEach((fn) => {
                    finalYPos = this.posY + (i - 1);
                    finalXPos = this.posX + jSignedMinusOne;
                    this.speedX = 0;
                    this.speedY = 0;
                    bonked = true;
                });
                if (bonked)
                    break;
            } if (bonked) 
                break;
        }
        if (!bonked) {
            finalXPos = this.posX + this.speedX;
            finalYPos = this.posY + this.speedY;
        }

        this.updatePosition(finalXPos, finalYPos);
        return true;
    }

    /* Called before physics(), with blocks in strict order from top left to bottom right. */
    physicsBefore() {
        this.calculateGroup();
    }

    /* god i fucking hate water physics */
    physicsBefore2() { }

    percolateFromWater(waterBlock) {
        if (this.waterContainmentMax.value == 0 || this.waterContainment >= this.waterContainmentMax.value) {
            return 0;
        }
        var heightDiff = this.posY - waterBlock.posY; // bigger number == lower, so if this is negative we are percolating up
        var maxAmountToPercolateFromBlock = 0;
        var amountToPercolate = 0;
        if (heightDiff > 0) {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax.value - this.waterContainment, this.waterContainmentTransferRate.value);
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, waterBlock.blockHealth);
            this.waterContainment += amountToPercolate;
            // flowing down
            return amountToPercolate;
        } else if (heightDiff == 0) {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax.value - this.waterContainment, this.waterContainmentTransferRate.value);
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, waterBlock.blockHealth);
            this.waterContainment += amountToPercolate;
            return amountToPercolate;
        } else {
            // flowing up
            // nvm
            return 0;
        }
    }

    percolateFromBlock(otherBlock) {
        var heightDiff = this.posY - otherBlock.posY; // bigger number == lower, so if this is negative we are percolating u
        if (this.waterContainment > otherBlock.waterContainment || this.waterContainment >= this.waterContainmentMax.value) {
            // water flows from wet to dry
            return 0;
        }
        var maxAmountToPercolateFromBlock = 0;
        var amountToPercolate = 0;
        if (heightDiff > 0) {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax.value - this.waterContainment, Math.min(this.waterContainmentTransferRate.value, otherBlock.waterContainment)) / 2;
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, (otherBlock.waterContainment - (this.waterContainment * 0.75)) / 2);
            this.waterContainment += amountToPercolate;
            return amountToPercolate;
        } else {
            maxAmountToPercolateFromBlock = Math.min(this.waterContainmentMax.value - this.waterContainment, Math.min(this.waterContainmentTransferRate.value, otherBlock.waterContainmentTransferRate.value)) / 2;
            amountToPercolate = Math.min(maxAmountToPercolateFromBlock, otherBlock.waterContainment - ((this.waterContainment + otherBlock.waterContainment) / 2));
            var amountToPercolateToAverage = (otherBlock.waterContainment - this.waterContainment) / 2;
            amountToPercolate = Math.min(amountToPercolate, amountToPercolateToAverage);
            amountToPercolate /= 2;
            this.waterContainment += amountToPercolate;
            return amountToPercolate;
            return 0;
        }
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }
        var directNeighbors = getDirectNeighbors(this.posX, this.posY).filter((sq) => sq != null && sq.solid);
        directNeighbors.forEach((sq) => this.waterContainment -= sq.percolateFromBlock(this));
    }

    evaporateInnerMoisture() {
        if (this.waterContainment == 0) {
            return;
        }

        var airCounter = getDirectNeighbors(this.posX, this.posY).map((sq) => (sq == null ? 1 : 0)).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        for (let i = 0; i < airCounter; i++) {
            if (Math.random() > (1 - this.waterContainmentTransferRate.value)) {
                this.waterContainment = Math.max(0, this.waterContainment - this.waterContainmentEvaporationRate.value);
            }
        }
    }

    suckWater(rootWaterSaturation) {
        if (rootWaterSaturation > this.waterContainment) {
            return 0;
        }
        var diff = this.waterContainment - rootWaterSaturation;
        var ret = Math.min(this.waterContainmentTransferRate.value, diff / 2);
        this.waterContainment -= (ret / global_plantToRealWaterConversionFactor.value);
        return ret;
    }
}