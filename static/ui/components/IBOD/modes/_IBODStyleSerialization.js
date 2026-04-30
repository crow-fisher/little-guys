import { loadGD, saveGD } from "../../../UIData.js";

let paramList = [
    "UI_CAMERA_OFFSET_VEC",
    "UI_SH_MINSIZE",
    "UI_SH_DISTPOWERMULT",
    "UI_SH_MAXLUMINENCE",
    "UI_SH_MINLUMINENCE",
    "UI_SH_STYLE_BRIGHTNESS_B",
    "UI_SH_STYLE_BRIGHTNESS_A",
    "UI_SH_STYLE_SIZE_A",
    "UI_SH_STYLE_SIZE_B",
    "UI_AA_PLOT_SELECTRADIUS",
    "UI_AA_PLOT_LOCALITY_SELECTMODE",
    "UI_AA_PLOT_ACTIVE",
    "UI_SH_STYLE_SIZE_C",
    "UI_SH_MAXSIZE",
    "UI_SH_STYLE_BRIGHTNESS_C"
    ];


export function getCurStarParams() {
    let out = Array.from(paramList.map((p) => loadGD(p)));
    let params = out.toString();
    return params
}

export function loadStarParams(params) {
    let paramValues = JSON.parse(params);
    for (let i = 0; i < paramValues.length; i++) {
        saveGD(paramList[i], params[i]);
    }
}
