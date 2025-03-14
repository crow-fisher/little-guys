import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { PageButton } from "../elements/PageButton.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { Slider } from "../elements/Slider.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { loadUI, UI_SPECIAL_WATER, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_SURFACE, UI_SOIL_COMPOSITION, UI_SPECIAL_SELECT, UI_BB_SIZE, UI_BB_STRENGTH, UI_SM_SPECIAL, UI_CENTER, UI_PALETTE_SOILIDX, UI_PALETTE_ROCKMODE, UI_BOOLEAN, UI_PALETTE_ROCKIDX } from "../UIData.js";

export class BlockPallate extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        this.numSoilRows = 3;
        this.initPallate();

        var sizeX = getBaseUISize() * 24;
        var half = sizeX / 2;
        var third = sizeX / 3;
        var quarter = sizeX / 4;

        let container = new Container(this.window, 0, 1);
        this.window.container = container;

        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.5, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.65), 0.75," "))
        container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.8, "block palette"))
        let row1 = new Container(this.window, 0, 0);
        let row2 = new Container(this.window, 0, 0);
        container.addElement(row1);
        container.addElement(row2);

        let buttonHeight = getBaseUISize() * 3;

        row1.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, UI_SPECIAL_WATER
        , () => getActiveClimate().getWaterColor(), () => getActiveClimate().getWaterColor(), 0.5));
        row1.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, UI_SPECIAL_AQUIFER,
         () => getActiveClimate().getWaterColorDark(), () => getActiveClimate().getWaterColor(), 0.5));
        row1.addElement(new RadioToggle(this.window, third, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, UI_SPECIAL_SURFACE,
         () => getActiveClimate().getSurfaceOnColor(), () => getActiveClimate().getWaterColor(), 0.5));


        row2.addElement(new Toggle(this.window, half, buttonHeight, UI_CENTER, UI_PALETTE_ROCKMODE, "",
            () => getActiveClimate().getPaletteRockColor(), () => getActiveClimate().getPaletteSoilColor()), 0.5);

        row2.addElement(new PageButton(this.window, half, buttonHeight, UI_CENTER, 
            () => loadUI(UI_PALETTE_ROCKMODE) ? UI_PALETTE_ROCKIDX : UI_PALETTE_SOILIDX, 
            () => (loadUI(UI_PALETTE_ROCKMODE) ? getActiveClimate().getBaseSoilColorBrightnessIdx : getActiveClimate().getBaseRockColorBrightnessIdx)(
                loadUI(UI_PALETTE_SOILIDX) + 1,
                [.40, .40, .20],
                0.5
            ), 0.5
        ));

        for (let i = 0; i < this.numSoilRows; i++) {
            let row = new Container(this.window, 0, 0);
            container.addElement(row);
            row.addElement(new RadioToggle(this.window, quarter, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, 
            "", () => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][0], 0.5),() => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][0], 1), 0.5));
            row.addElement(new RadioToggle(this.window, quarter, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, 
            "", () => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][1], 0.5),() => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][1], 1), 0.5));
            row.addElement(new RadioToggle(this.window, quarter, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, 
            "", () => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][2], 0.5),() => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][2], 1), 0.5));
            row.addElement(new RadioToggle(this.window, quarter, buttonHeight, UI_CENTER, UI_SPECIAL_SELECT, 
                "", () => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][3], 0.5),() => getActiveClimate().getBaseSoilColorBrightness(this.palette[i][3], 1), 0.5));
        }

        let strengthSizeContainer = new Container(this.window, padding, 0);
        container.addElement(strengthSizeContainer);

        let sizeContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(sizeContainer);

        sizeContainer.addElement(new Text(this.window, sizeX / 2, getBaseUISize() * 1.5, UI_CENTER, "size"));
        sizeContainer.addElement(new Slider(this.window, UI_BB_SIZE, sizeX / 2, getBaseUISize() * 3, 2, 14, () => getActiveClimate().getUIColorTransient()));

        let strengthContainer = new Container(this.window, padding, 1);
        strengthSizeContainer.addElement(strengthContainer);

        strengthContainer.addElement(new Text(this.window, sizeX / 2, getBaseUISize() * 1.5, UI_CENTER, "strength"));
        strengthContainer.addElement(new Slider(this.window, UI_BB_STRENGTH, sizeX / 2, getBaseUISize() * 3, 0, 1,  () => getActiveClimate().getUIColorTransient()));
    }

    initPallate() {
        this.palette = new Map();
        this.palette[0] = [[.60, .20, .20], [.40, .20, .40], [.40, .40, .20],  [.40, .40, .20]];
        this.palette[1] = [[.75, .15, .10], [.40, .10, .50], [.30, .60, .10],  [.40, .50, .10]];
        this.palette[2] = [[.60, .20, .20], [.40, .20, .40], [.15, .65, .20],  [.10, .85, .05]];
    }
}