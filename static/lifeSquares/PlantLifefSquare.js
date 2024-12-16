import { BaseLifeSquare } from "./BaseLifeSquare.js";
import { getDirectNeighbors } from "../squares/_sqOperations.js";
import { BASE_SIZE, MAIN_CANVAS, MAIN_CONTEXT } from "../index.js";

import {
    p_ls_airNutrientsPerExposedNeighborTick,
    } from "../config/config.js"


class PlantLifeSquare extends BaseLifeSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantLifeSquare";
        this.colorBase = "#157F1F";
        this.type = "green";
        this.image = loadImage("static/icons/plantSquare.png");
    }

    render() {
        var plantPattern = MAIN_CONTEXT.createPattern(this.image, 'repeat');
        MAIN_CONTEXT.fillStyle = plantPattern;
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };


    tick() {
        this.airNutrients = 0;
        this.airNutrients = getDirectNeighbors(this.posX, this.posY)
                .filter((nb) => nb != null)
                .map((sq) => p_ls_airNutrientsPerExposedNeighborTick.value)
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0,
                );
    }
}

function loadImage(url) {
    let i = new Image();
    i.src = url;
    return i;
}

export {PlantLifeSquare}