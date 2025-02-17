import { hexToRgb } from "./common.js";

export class Climate {
    constructor() {
        this.soilColorSand = hexToRgb("#773319");
        this.soilColorClay = hexToRgb("#33251b");
        this.soilColorSilt = hexToRgb("#c99060");

        this.rockColorSand = hexToRgb("#ba9670");
        this.rockColorClay = hexToRgb("#664935");
        this.rockColorSilt = hexToRgb("#988570");
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