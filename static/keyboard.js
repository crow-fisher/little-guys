import { doZoom, resetZoom } from "./canvas.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "./globals.js";
import { loadUI, saveUI, UI_BB_EYEDROPPER, UI_BB_MIXER } from "./ui/UIData.js";

export function keydown(e) {
    e.preventDefault();
    if (e.key == "s") {
        doZoom(-0.1);
    }
    if (e.key == "x") {
        doZoom(0.1);
    }
    if (e.key == "z") {
        setGlobalThetaBase(getGlobalThetaBase() + 0.1);
    }
    if (e.key == "c") {
        setGlobalThetaBase(getGlobalThetaBase() - 0.1);
    }

    if (e.key == 'q') {
        saveUI(UI_BB_EYEDROPPER, !loadUI(UI_BB_EYEDROPPER));
    }
    if (e.key == 'w') {
        saveUI(UI_BB_MIXER, !loadUI(UI_BB_MIXER));
    }
    if (e.key == "Escape") {
        resetZoom();
    }
}

export function keyup(e) {
}