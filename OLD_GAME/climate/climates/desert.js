import { hexToRgb } from "../../common.js";
import { Climate } from "../climate.js"

export class Desert extends Climate {
    constructor() {
        super();
        this.soilColorSand = hexToRgb("#e48c43");
        this.soilColorClay = hexToRgb("#b1442f");
        this.soilColorSilt = hexToRgb("#654641");

        this.rockColorSand = hexToRgb("#8f6954");
        this.rockColorClay = hexToRgb("#855549");
        this.rockColorSilt = hexToRgb("#6c4057");
    }
}