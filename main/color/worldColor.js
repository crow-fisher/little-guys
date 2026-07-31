import { DO_K_RENDERMODE_BWPRINT } from "../debugOptions.js";
import { hsv2rgb, rgb2hsv } from "./color.js";

// "floor bound color"
export function calculateTempColor(temperature) {
    temperature = Math.max(2500, Math.min(temperature, 6500));
    temperature /= 100;
    return {
        r: fbc(temp_red(temperature)),
        g: fbc(temp_green(temperature)),
        b: fbc(temp_blue(temperature))
    };
}
export function fbc(v) {
    return Math.min(v, Math.max(v, 0, 255));
}

export function temp_red(temperature) {
    let red;
    if (temperature < 66) {
        red = 255;
    } else {
        red = temperature - 60;
        red = 329.698727446 * (red ** (-0.1332047592))
    }
    return red;
}

export function temp_green(temperature) {
    let green = 0;
    if (temperature < 66) {
        green = temperature;
        green = 99.4708 * Math.log(green) - 161.1195;
    } else {
        green = temperature - 60;
        green = 288.122169 * (green ** (-.0755));
    }
    return green;
}

export function temp_blue(temperature) {
    let blue = 0;
    if (temperature > 66) {
        blue = 255;
    } else if (temperature <= 19) {
        blue = 0;
    } else {
        blue = temperature - 10;
        blue = 138.517 * Math.log(blue) - 305.0447;
    }
    return blue;
}

export function tempToColorForStar(temperature, renderMode = null) {
    let dc = calculateTempColor(temperature);
    let rgb = [dc.r, dc.g, dc.b];
    
    if (renderMode = DO_K_RENDERMODE_BWPRINT) {
        let hsv = rgb2hsv(...rgb);
        hsv[2] /= 10;
        rgb = hsv2rgb(...hsv);
    }

    return rgb;
}