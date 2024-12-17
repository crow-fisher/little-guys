import { BaseSquare } from "./BaseSqaure.js";
import { d_sq_nutrientValue } from "../config/config.js";

import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount } from "../config/config.js";
class ClaySquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "ClaySquare";
        this.colorBase = "#B06C49";
        this.nutrientValue = d_sq_nutrientValue;
        this.rootable = true;
        
        this.renderWithColorRange = true;
        this.baseColor = "#b88a5f";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#855c48";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#bf9e7c";
        this.accentColorAmount = dirt_accentColorAmount;

    }
}

export {ClaySquare}