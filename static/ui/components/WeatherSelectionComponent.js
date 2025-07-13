import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { UI_BIGDOTHOLLOW, UI_TINYDOT } from "../../common.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { Toggle } from "../elements/Toggle.js";
import { ToggleFunctionalText } from "../elements/ToggleFunctionalText.js";
import { LockedComponent } from "../LockedComponent.js";
import {
    UI_CLIMATE_WEATHER_CLEAR,
    UI_CLIMATE_WEATHER_LIGHTRAIN,
    UI_CLIMATE_WEATHER_HEAVYRAIN, UI_CLIMATE_WEATHER_PARTLY_CLOUDY,
    UI_CLIMATE_WEATHER_MOSTLY_CLOUDY,
    UI_CLIMATE_WEATHER_FOGGY, UI_CLIMATE_WEATHER_ACTIVE,
    UI_SIMULATION_CLOUDS,
    loadGD,
    UI_CENTER,
    UI_DEBUG_CLIMATE_WEATHER_FOREVER
} from "../UIData.js";
export class WeatherSelectionComponent extends LockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key);
        let sizeX = getBaseUISize() * 41;
        let halfSizeX = sizeX / 2;
        let container = new Container(this.window, padding, 1);
        this.window.container = container; 

        let textAlignOffsetX = getBaseUISize() * .67;

        let spacingMult = 1.12;

        container.addElement(new ToggleFunctionalText(this.window, sizeX, getBaseUISize() * 3 * spacingMult, textAlignOffsetX, UI_SIMULATION_CLOUDS, () => {
            if (loadGD(UI_SIMULATION_CLOUDS)) {
                return UI_BIGDOTHOLLOW + "disable weather"
             } else {
                return UI_TINYDOT + "enable weather";
             }
            },() => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.68), 0.75 / spacingMult));

        let weatherSelectConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_SIMULATION_CLOUDS));
        container.addElement(weatherSelectConditionalContainer);

        let weatherRow1 = new Container(this.window, padding, 0);
        let weatherRow2 = new Container(this.window, padding, 0);
        let weatherRow3 = new Container(this.window, padding, 0);

        weatherSelectConditionalContainer.addElement(weatherRow1);
        weatherSelectConditionalContainer.addElement(weatherRow2);
        weatherSelectConditionalContainer.addElement(weatherRow3);

        weatherRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "clear",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_CLEAR, () => getActiveClimate().getUIColorInactiveCustom(0.54 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.54), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
        weatherRow1.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "partly cloudy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_PARTLY_CLOUDY, () => getActiveClimate().getUIColorInactiveCustom(0.56 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.56), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
        weatherRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "mostly cloudy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_MOSTLY_CLOUDY, () => getActiveClimate().getUIColorInactiveCustom(0.60 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.60), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
        weatherRow2.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "foggy",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_FOGGY, () => getActiveClimate().getUIColorInactiveCustom(0.59 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.59), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
        weatherRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "light rain",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_LIGHTRAIN, () => getActiveClimate().getUIColorInactiveCustom(0.58 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
        weatherRow3.addElement(new RadioToggleLabel(this.window,sizeX / 2 - (padding / 2), getBaseUISize() * 3, textAlignOffsetX, "heavy rain",UI_CLIMATE_WEATHER_ACTIVE, UI_CLIMATE_WEATHER_HEAVYRAIN, () => getActiveClimate().getUIColorInactiveCustom(0.55 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, [UI_TINYDOT, UI_BIGDOTHOLLOW]));
    
        weatherSelectConditionalContainer.addElement(new Toggle(this.window, sizeX, getBaseUISize() * 3, UI_CENTER, UI_DEBUG_CLIMATE_WEATHER_FOREVER, "forever weather", () => getActiveClimate().getUIColorInactiveCustom(0.55 + 0.2), () => getActiveClimate().getUIColorInactiveCustom(0.55)))
    }
}