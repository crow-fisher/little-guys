
import { BaseLifeSquare, LSQ_RENDER_SIZE_MULT } from "./BaseLifeSquare.js";
import { getDirectNeighbors, getNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";
import { loadImage, rgbToRgba } from "../common.js";
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

        this.baseColor = "#5BAD35";
        this.darkColor = "#34631A";
        this.accentColor = "#95B633";
    }

    flower() {
        if (this.linkedOrganism.getLifeCyclePercentage() > this.linkedOrganism.flowerEnd + (this.shouldFlower * 0.02)) {
            this.opacity -= 0.001;
            if (this.opacity < 0) {
                this.destroy();
                return;
            }
            this.flowering = false;
            return;
        }

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
        if (this.linkedOrganism.getLifeCyclePercentage() < this.linkedOrganism.flowerStart + this.shouldFlower * .01) {
            return;
        }
        if (!this.shouldFlowerFlag) {
            return;
        }
    
        this.flowering = true;
    }

    render() {
        super.render();
        if (this.flowering) {
            MAIN_CONTEXT.fillStyle = rgbToRgba(this.flowerColorRgb.r, this.flowerColorRgb.g, this.flowerColorRgb.b, this.opacity);
            MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            this.width * BASE_SIZE,
            this.height * BASE_SIZE
            );
            MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(
                (Math.max(0, this.shouldFlower - this.linkedOrganism.distToEdge(this.posX, this.posY))), 
                2 
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
        super.darkeningRender();
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
                    .map((sq) => 0.85)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
        if (this.linkedOrganism.getLifeCyclePercentage() > (1 - (1 - this.linkedOrganism.flowerEnd) * 2)) {
            if (this.linkedOrganism.blocksToEdge(this.posX, this.posY) < (this.shouldFlower * 0.7)) {
                this.opacity -= 0.01;
                if (this.opacity < 0) {
                    this.linkedOrganism.removeAssociatedLifeSquare(this);
                    return;
                }
            }
        }
    }
}



export { HydrangeaGreenLifeSquare }