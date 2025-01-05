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

        this.jointGrowthPlan = null;

        this.stemBaseColor = "#a4b25c";
        this.stemDarkColor = "#4c5731";
        this.stemAccentColor = "#b1be7f";

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

    getGrowthPlan() {
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