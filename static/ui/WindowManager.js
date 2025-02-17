import { Radio } from "./elements/Radio.js";
import { SoilPickerElement } from "./SoilPicker.js";
import { UI_SOIL_VIEWMODE } from "./UIData.js";
import { Window } from "./Window.js";

var all_windows = [];
var windowHovered = false;

export function resetWindowHovered() {
    all_windows.forEach((window) => window.hovered = false);
}
export function isWindowHovered() {
    return all_windows.some((window) => window.hovered);
}

var window = new Window(100, 100, 10, 1);
all_windows.push(window);

window.addElement(new SoilPickerElement(window, 200, 100));
window.addElement(new Radio(window, 200, 35, UI_SOIL_VIEWMODE, ["🎨", "💦", "⚡"]));

export function renderWindows() {
    all_windows.forEach((window) => window.render());
}
export function updateWindows() {
    all_windows.forEach((window) => window.update());
}

