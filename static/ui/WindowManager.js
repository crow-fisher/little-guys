import { SoilPickerElement } from "./SoilPicker.js";
import { Window } from "./Window.js";

var all_windows = [];
var window = new Window(100, 100, 0);
all_windows.push(window);
window.addElement(new SoilPickerElement(100, 100, false));
export function renderWindows() {
    all_windows.forEach((window) => window.render());
}