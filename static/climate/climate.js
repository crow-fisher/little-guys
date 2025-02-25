import { hexToRgb } from "../common.js";

export class Climate {
    constructor() {
        this.soilColorSand = hexToRgb("#c99060");
        this.soilColorClay = hexToRgb("#773319");
        this.soilColorSilt = hexToRgb("#33251b");

        this.rockColorSand = hexToRgb("#666264");
        this.rockColorClay = hexToRgb("#020204");
        this.rockColorSilt = hexToRgb("#c4bebe");
    }

    setSoilColors(sandColor, clayColor, siltColor) {
        this.soilColorSand = sandColor;
        this.soilColorClay = clayColor;
        this.soilColorSilt = siltColor;
    }

    setRockColors(sandColor, clayColor, siltColor) {
        this.rockColorSand = sandColor;
        this.rockColorClay = clayColor;
        this.rockColorSilt = siltColor;
    }
}