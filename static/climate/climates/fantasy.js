import { hexToRgb } from "../../common.js";
import { Climate } from "../climate.js"

export class Fantasy extends Climate {
    constructor() {
        super();
        this.soilColorSand = hexToRgb("#93a2c3");
        this.soilColorSilt = hexToRgb("#3e4e80");
        this.soilColorClay = hexToRgb("#31284f");

        this.rockColorSand = hexToRgb("#bfa865");
        this.rockColorSilt = hexToRgb("#666012");
        this.rockColorClay = hexToRgb("#c6ad49");

        this.waterColor = hexToRgb("#999AC6");


    }
}