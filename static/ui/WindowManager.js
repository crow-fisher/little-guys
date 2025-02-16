import { SoilPickerElement } from "./SoilPicker.js";
import { Window } from "./Window.js";

var all_windows = [];
var window = new Window(100, 100, 0);
all_windows.push(window);
window.addElement(new SoilPickerElement(200, 100));
export function renderWindows() {
    all_windows.forEach((window) => window.render());
}
export function updateWindows() {
    all_windows.forEach((window) => window.update());
}