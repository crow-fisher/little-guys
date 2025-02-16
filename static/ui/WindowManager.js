import { Radio } from "./elements/Radio.js";
import { SoilPickerElement } from "./SoilPicker.js";
import { Window } from "./Window.js";

var all_windows = [];
var windowHovered = false;
var window = new Window(100, 100, 10, 1);
all_windows.push(window);

window.addElement(new SoilPickerElement(200, 100));
window.addElement(new Radio(200, 35, "FUCK", ["🎨", "💦", "⚡"]));

export function renderWindows() {
    all_windows.forEach((window) => window.render());
}
export function updateWindows() {
    all_windows.forEach((window) => window.update());
}

export function setWindowHovered() {
    windowHovered = true;
}
export function resetWindowHovered() {
    windowHovered = false;
}
export function isWindowHovered() {
    return windowHovered;
}