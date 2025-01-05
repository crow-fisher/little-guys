import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"


class SunflowerGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "SunflowerGreenLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.subtype = "stem"; // others - "joint", "flower"
        this.width = .99;

        this.deflectionStrength = 70;

        // leaves grow like this 

        this.flowerBloomGrowthPlan = null;
        this.flowerCenterGrowthPlan = null;
        this.jointGrowthPlan = null;

        this.stemBaseColor = "#a4b25c";
        this.stemDarkColor = "#4c5731";
        this.stemAccentColor = "#b1be7f";

        this.flowerCenterBaseColor = "#6f4d42";
        this.flowerCenterDarkColor = "#38261f";
        this.flowerCenterAccentColor = "#806341";

        this.flowerPetalBaseColor = "#fcc71e";
        this.flowerPetalDarkColor = "#bf5706";
        this.flowerPetalAccentColor = "#fcf73f";

        this.colorMode = "stem"; // others - "flowerCenter", "flowerPetal"

        this.baseColor = this.stemBaseColor;
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = this.stemDarkColor;
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = this.stemAccentColor; 
        this.accentColorAmount = dirt_accentColorAmount;

        // width and xOffset are scaled between 0 and 1
        // width of 0.8 means it occupies 80% of the X width 
        // xOffset of 0 means the left block side is all the way to the left
        // xOffset of 1 means the right block side is all the way to the right 
    }

    preTick() {
        super.preTick();

        if (this.colorMode != this.subtype) {
            this.colorMode = this.subtype;
            if (this.subtype == "flowerCenter") {
                this.baseColor = this.flowerCenterBaseColor;
                this.darkColor = this.flowerCenterDarkColor;
                this.accentColor = this.flowerCenterAccentColor;
            }
            if (this.subtype == "flowerPetal") {
                this.baseColor = this.flowerPetalBaseColor;
                this.darkColor = this.flowerPetalDarkColor;
                this.accentColor = this.flowerPetalAccentColor;
            }
        }
    }
    getFlowerCenterGrowthPlan() {
        if (this.type != "flower" || this.subtype != "flowerStart") {
            return [];
        } 
        if (this.flowerCenterGrowthPlan != null) {
            return this.flowerCenterGrowthPlan;
        }
        this.flowerCenterGrowthPlan = new Array();

        this.flowerCenterGrowthPlan.push([this.posX, this.posY - 1]);
        this.flowerCenterGrowthPlan.push([this.posX, this.posY - 2]);
        this.flowerCenterGrowthPlan.push([this.posX, this.posY - 3]);

        this.flowerCenterGrowthPlan.push([this.posX + 1, this.posY - 2]);
        this.flowerCenterGrowthPlan.push([this.posX - 1, this.posY - 2]);

        return this.flowerCenterGrowthPlan;
    }

    getFlowerBloomGrowthPlan() {
        if (this.type != "flower" || this.subtype != "flowerStart") {
            return [];
        } 
        if (this.flowerBloomGrowthPlan != null) {
            return this.flowerBloomGrowthPlan;
        }
        this.flowerBloomGrowthPlan = new Array();

        var centerX = this.posX;
        var centerY = this.posY - 2;

        var circleRadius = this.linkedOrganism.flowerRadius;

        for (let i = 0; i < circleRadius; i++) {
            for (let j = 0; j < circleRadius; j++) {
                var dist = Math.ceil((i ** 2 + j ** 2) ** 0.5);
                if (dist > circleRadius) {
                    continue;
                }
                this.flowerBloomGrowthPlan.push([centerX - i, centerY - j, dist]);
                this.flowerBloomGrowthPlan.push([centerX - i, centerY + j, dist]);
                this.flowerBloomGrowthPlan.push([centerX + i, centerY - j, dist]);
                this.flowerBloomGrowthPlan.push([centerX + i, centerY + j, dist]);
            }
        }

        return this.flowerBloomGrowthPlan;
    }

    getJointGrowthPlan() {
        if (this.subtype != "joint" || this.type != "green") {
            return [];
        } 
        if (this.jointGrowthPlan != null) {
            return this.jointGrowthPlan;
        }

        this.jointGrowthPlan = new Array();
        // ooh boy, we have to make it now

        var side = this.linkedOrganism.nextSide;
        this.linkedOrganism.nextSide = (this.linkedOrganism.nextSide == 1 ? -1 : 1);

        // -1 is left, 1 is right
        // first one 
        this.jointGrowthPlan.push([this.posX + side, this.posY]);
        // second one 
        this.jointGrowthPlan.push([this.posX + 2 * side, this.posY])
        this.jointGrowthPlan.push([this.posX + 2 * side, this.posY + 1])
        // third one 
        this.jointGrowthPlan.push([this.posX + 3 * side, this.posY])
        this.jointGrowthPlan.push([this.posX + 3 * side, this.posY + 1])

        return this.jointGrowthPlan;
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                8 - getNeighbors(this.posX, this.posY)
                    .filter((sq) => !sq.surface)
                    .map((sq) => 1)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                getNeighbors(this.posX, this.posY)
                    .filter((sq) => sq.organic)
                    .map((sq) => 0.65)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );


    }
}



export { SunflowerGreenLifeSquare }