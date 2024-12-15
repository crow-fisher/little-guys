import { BaseSquare } from "./BaseSqaure.js";
import { d_sq_nutrientValue } from "../config/config.js";
class DirtSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "DirtSquare";
        this.colorBase = "#B06C49";
        this.nutrientValue = d_sq_nutrientValue;
        this.rootable = true;
    }
}

export {DirtSquare}