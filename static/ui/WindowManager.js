import { Radio } from "./elements/Radio.js";
import { SoilPickerElement } from "./SoilPicker.js";
import { Window } from "./Window.js";

var all_windows = [];
var window = new Window(100, 100, 1);
all_windows.push(window);
window.addElement(new SoilPickerElement(200, 100));

window.addElement(new Radio(200, 50, "FUCK", ["c1", "c2"]));

export function renderWindows() {
    all_windows.forEach((window) => window.render());
}
export function updateWindows() {
    all_windows.forEach((window) => window.update());
}