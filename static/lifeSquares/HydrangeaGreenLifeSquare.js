import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage } from "../common.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";

import {
    airNutrientsPerEmptyNeighbor,
} from "../config/config.js"
import { getOrganismSquaresAtSquare } from "./_lsOperations.js";


class HydrangeaGreenLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "HydrangeaGreenLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.width = .99;

        this.baseColor = "#87a600";
        this.darkColor = "#2e6301";
        this.accentColor = "#a1b739";
    }

    flower() {
        if (this.numAdjacentFlowers == 0) {
            this.numAdjacentFlowers = getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.linkedOrganismSquares.some((sq) => sq.flowering))
            .map((sq) => (0.5 + Math.random()))
            .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );
        }
        if (this.numAdjacentFlowers > 3) {
            this.flowering = false;
            return;
        }
        if (this.linkedOrganism.distToEdge(this.posX, this.posY) > this.shouldFlower) {
            return;
        }
    
        this.flowering = true;
    }

    render() {
        super.render();
        if (this.flowering) {
            MAIN_CONTEXT.fillStyle = this.flowerColorRgba; 
            MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            this.width * BASE_SIZE,
            this.height * BASE_SIZE
            );
            MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(
                (Math.max(0, this.linkedOrganism.distToEdge(this.posX, this.posY) - this.shouldFlower / 2)), 
                4 
            );
            MAIN_CONTEXT.fillRect(
                this.posX * BASE_SIZE,
                this.posY * BASE_SIZE,
                this.width * BASE_SIZE,
                this.height * BASE_SIZE
                );
        }
    }

    darkeningRender() {
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(this.distFromOrigin, this.linkedOrganism.maxDistFromOrigin);
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            this.width * BASE_SIZE,
            this.height * BASE_SIZE
        );
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                8 - getNeighbors(this.posX, this.posY)
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
                    .map((sq) => 0.85)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
    }
}



export { HydrangeaGreenLifeSquare }