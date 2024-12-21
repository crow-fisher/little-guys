import {
    dirt_baseColorAmount,
    dirt_darkColorAmount,
    dirt_accentColorAmount,
    global_plantToRealWaterConversionFactor,
    b_sq_nutrientValue,
    base_waterContainmentMax,
    base_waterContainmentTransferRate,
    base_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
} from "../config/config.js"

import { getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares } from "./_sqOperations.js"
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, darkeningColorCache,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic
} from "../globals.js";

import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE } from "../index.js";

import { hexToRgb, rgbToHex, rgbToRgba } from "../common.js";

import { getCountOfOrganismsSquaresOfTypeAtPosition } from "../lifeSquares/_lsOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { removeItemAll } from "../common.js";
import { getObjectArrFromMap } from "../common.js";
import { addOrganism, addNewOrganism } from "../organisms/_orgOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";

import { purge, reset, render, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquare } from "../globalOperations.js"

import { removeOrganismSquare } from "./_sqOperations.js";

import { removeOrganism } from "../organisms/_orgOperations.js";



export class BaseSquare {
    constructor(posX, posY) {
        this.proto = "BaseSquare";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.solid = true;
        this.spawnedEntityId = 0;
        // block properties - overridden by block type
        this.physicsEnabled = true;
        this.blockHealth = 1; // when reaches zero, delete
        // water flow parameters
        this.waterContainment = 0;
        this.waterContainmentMax = base_waterContainmentMax;
        this.waterContainmentTransferRate = base_waterContainmentTransferRate; // what fraction of ticks does it trigger percolate on
        this.waterContainmentEvaporationRate = base_waterContainmentEvaporationRate; // what fraction of contained water will get reduced per tick
        this.speedX = 0;
        this.speedY = 0;
        this.nutrientValue = b_sq_nutrientValue;
        this.rootable = false;
        this.group = -1;
        this.organic = false;
        this.collision = true;
        this.visible = true; 
        this.randoms = [];
        this.linkedOrganism = null;
        this.linkedOrganismSquares = new Array();
        this.renderWithColorRange = false;
        // for ref - values from dirt
        this.baseColor = "#9A8873";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColorAmount = dirt_accentColorAmount;
        this.opacity = 1;
        this.waterSinkRate = 0.95;
    };
    destroy() {
        removeSquare(this);
    }
    linkOrganism(organism) {
        this.linkedOrganism = organism;
    }
    unlinkOrganism() {
        this.linkedOrganism = null;
    }
    linkOrganismSquare(organismSquare) {
        if (organismSquare in this.linkedOrganismSquares) {
            console.warn("Trying to link an organismSquare that it's already been attached to...odd state.");
        }
        this.linkedOrganismSquares.push(organismSquare);
    }
    unlinkOrganismSquare(organismSquare) {
        this.linkedOrganismSquares = Array.from(this.linkedOrganismSquares.filter((lsq) => lsq != organismSquare));
    }
    reset() {
        if (this.blockHealth <= 0) {
            removeSquare(this);
        }
        this.group = -1;
        this.speedY += 1;
    }
    render() {
        if (!this.visible) {
            return;
        }
        this.renderWithVariedColors();
    };

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    swapColors(otherSquare) {
        var t1 = this.randoms;
        this.randoms = otherSquare.randoms;
        otherSquare.randoms = t1;
    }

    renderWithVariedColors() {
        var res = this.getStaticRand(1) * (parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value) + parseFloat(this.baseColorAmount.value)); 
        var primaryColor = null;
        var altColor1 = null;
        var altColor2 = null;

        if (res < parseFloat(this.accentColorAmount.value)) {
            primaryColor = this.accentColor;
            altColor1 = this.darkColor;
            altColor2 = this.baseColor;
        } else if (res < parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value)) {
            primaryColor = this.darkColor;
            altColor1 = this.baseColor;
            altColor2 = this.darkColor;
        } else {
            altColor1 = this.darkColor;
            altColor2 = this.darkColor;
            primaryColor = this.baseColor;
        }

        var rand = this.getStaticRand(2);
        var baseColorRgb = hexToRgb(primaryColor);
        var altColor1Rgb = hexToRgb(altColor1);
        var altColor2Rgb = hexToRgb(altColor2);

        var outColor = {
            r: baseColorRgb.r * 0.5 + ((altColor1Rgb.r * rand + altColor2Rgb.r * (1 - rand)) * 0.5),
            g: baseColorRgb.g * 0.5 + ((altColor1Rgb.g * rand + altColor2Rgb.g * (1 - rand)) * 0.5),
            b: baseColorRgb.b * 0.5 + ((altColor1Rgb.b * rand + altColor2Rgb.b * (1 - rand)) * 0.5)
        }

        var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
        // var outHex = rgbToHex(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b));

        MAIN_CONTEXT.fillStyle = outRgba;
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );

        if (this.solid) {
            MAIN_CONTEXT.fillStyle = this.calculateDarkeningColor()
            MAIN_CONTEXT.fillRect(
                this.posX * BASE_SIZE,
                this.posY * BASE_SIZE,
                BASE_SIZE,
                BASE_SIZE
            );
        }
    }

    calculateDarkeningColor() {
        return this.calculateDarkeningColorImpl(this.waterContainment, this.waterContainmentMax.value);
    }

    calculateDarkeningColorImpl(darkVal, darkValMax) {
        if (darkVal == 0) {
            return "rgba(67,58,63, 0)";
        }
        var waterColor255 = Math.floor((darkVal / darkValMax) * 255) * this.opacity;
        if (waterColor255 in darkeningColorCache) {
            return darkeningColorCache[waterColor255];
        }
        var darkeningStrength = (darkVal / darkValMax) * b_sq_darkeningStrength.value;
        var res = "rgba(67,58,63," + darkeningStrength +")";

        darkeningColorCache[waterColor255] = res;

        return res;
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
            .filter((sq) => this.collision && sq.collision)
            .forEach((sq) => {
                error = true;
            });
        if (error) {
            console.warn("Square not moved; new occupied by a block with collision.");
            return false;
        }
        this.linkedOrganismSquares.forEach((lsq) => {
            removeOrganismSquare(lsq);
            lsq.posX = newPosX;
            lsq.posY = newPosY;
            addOrganismSquare(lsq);
        })

        if (this.linkedOrganism != null) {
            removeOrganism(this.linkedOrganism);
            this.linkedOrganism.posX = newPosX;
            this.linkedOrganism.posY = newPosY;
            addOrganism(this.linkedOrganism);
        }

        removeSquare(this);
        this.posX = newPosX;
        this.posY = newPosY;
        addSquare(this);

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

        this.waterSinkPhysics();

        var finalXPos = this.posX;
        var finalYPos = this.posY;
        var bonked = false;

        for (let i = 1; i < this.speedY + 1; i++) {
            for (let j = 0; j < Math.abs(this.speedX) + 1; j++) {
                var jSigned = (this.speedX > 0) ? j : -j;
                var jSignedMinusOne = (this.speedX == 0 ? 0 : (this.speedX > 0) ? (j - 1) : -(j - 1));
                getSquares(this.posX + jSigned, this.posY + i)
                    .filter((sq) => (sq.collision || (
                        (this.organic && sq.organic) &&
                        this.spawnedEntityId == sq.spawnedEntityId
                    )))
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

    waterSinkPhysics() {
        getSquares(this.posX, this.posY + 1)
        .filter((sq) => sq.proto == "WaterSquare")
        .forEach((sq) => {
            if (Math.random() > this.waterSinkRate) {
                removeSquare(sq);
                sq.posY -= 1;
                this.updatePosition(this.posX, this.posY + 1);
                addSquare(sq);
            }
        });
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

    suckWater(rootRequestedWater) {
        if (rootRequestedWater <= 0) {
            return 0;
        }
        var ret = Math.min(rootRequestedWater, this.waterContainment);
        this.waterContainment -= ret;
        return ret; 
    }
}