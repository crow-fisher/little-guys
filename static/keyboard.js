import { doZoom, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { saveUI, UI_BB_EYEDROPPER } from "./ui/UIData.js";

export function keydown(e) {
    e.preventDefault();
    if (e.key == "w") {
        doZoom(-0.1);
    }
    if (e.key == "s") {
        doZoom(0.1);
    }
    if (e.key == "a") {
        setGlobalThetaBase(getGlobalThetaBase() + 0.1);
    }
    if (e.key == "d") {
        setGlobalThetaBase(getGlobalThetaBase() - 0.1);
    }

    if (e.key == 'e') {
        saveUI(UI_BB_EYEDROPPER, true);
    }
    if (e.key == "Escape") {
        resetZoom();
    }
}

export function keyup(e) {
}