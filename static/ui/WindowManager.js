import { BlockBuildingComponent } from "./components/BlockBuildingComponent.js";
import { LightingComponent } from "./components/LightingComponent.js";
import { SubMenuComponent } from "./components/SubMenuComponent.js";
import { Radio } from "./elements/Radio.js";
import { Slider } from "./elements/Slider.js";
import { SoilPickerElement } from "./elements/SoilPicker.js";
import { UI_ROCK_COMPOSITION, UI_SOIL_COMPOSITION, UI_SOIL_INITALWATER, UI_SOIL_VIEWMODE } from "./UIData.js";
import { Window } from "./Window.js";

var all_components = [];
var windowHovered = false;

export function resetWindowHovered() {
    all_components.forEach((component) => {
        component.window.hovered = false;
        component.window.locked = false;
    
    });
}
export function isWindowHovered() {
    return all_components.some((component) => component.window.hovered);
}

all_components.push(new BlockBuildingComponent());
all_components.push(new LightingComponent());
all_components.push(new SubMenuComponent());
// var window = new Window(100, 100, 10, 1);
// all_windows.push(window);

// window.addElement(new SoilPickerElement(window, UI_SOIL_COMPOSITION, 200, 100));
// window.addElement(new SoilPickerElement(window, UI_ROCK_COMPOSITION, 200, 100));
// window.addElement(new Radio(window, 200, 35, UI_SOIL_VIEWMODE, ["🎨", "💦", "⚡"]));
// window.addElement(new Slider(window, 200, 35, UI_SOIL_INITALWATER, -15, -2));

export function renderWindows() {
    all_components.forEach((window) => window.render());
}
export function updateWindows() {
    all_components.forEach((window) => window.update());
}

