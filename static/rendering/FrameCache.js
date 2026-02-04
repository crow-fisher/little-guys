import { getCanvasHeight, getCanvasWidth } from "../canvas.js";
import { loadGD, UI_SH_MINSIZE, UI_SH_STYLE_SIZE_A , UI_SH_STYLE_BRIGHTNESS_B, UI_SH_STYLE_BRIGHTNESS_A,
UI_SH_STYLE_SIZE_B,
UI_STARMAP_ZOOM,
UI_CAMERA_OFFSET_VEC,
UI_STARMAP_VIEWMODE,
UI_AA_PLOT_LOCALITY_SELECTMODE,
UI_AA_PLOT_SELECTRADIUS,
UI_AA_SETUP_MULT,
UI_AA_SETUP_SELECT_MULT,
UI_STARMAP_STAR_MIN_SIZE
} from "../ui/UIData.js";

export class FrameCache {
    constructor() {
        this.prepareFrameCache();
    }

    prepareFrameCache() {
        this.UI_SH_MINSIZE = loadGD(UI_SH_MINSIZE);
        this.UI_SH_STYLE_SIZE_A = loadGD(UI_SH_STYLE_SIZE_A);
        this.UI_SH_STYLE_BRIGHTNESS_B = loadGD(UI_SH_STYLE_BRIGHTNESS_B);
        this.UI_SH_STYLE_BRIGHTNESS_A = loadGD(UI_SH_STYLE_BRIGHTNESS_A);
        this.UI_SH_STYLE_SIZE_B = loadGD(UI_SH_STYLE_SIZE_B);
        this.UI_STARMAP_ZOOM = loadGD(UI_STARMAP_ZOOM)
        this.UI_CAMERA_OFFSET_VEC = loadGD(UI_CAMERA_OFFSET_VEC);
        this.UI_STARMAP_VIEWMODE = loadGD(UI_STARMAP_VIEWMODE);
        this.UI_AA_PLOT_LOCALITY_SELECTMODE = loadGD(UI_AA_PLOT_LOCALITY_SELECTMODE);
        this.selectRadius = Math.exp(loadGD(UI_AA_PLOT_SELECTRADIUS));
        this.UI_AA_SETUP_MULT = Math.exp(loadGD(UI_AA_SETUP_MULT));
        this.namedStarOpacityMult = 1 + Math.exp(loadGD(UI_AA_SETUP_SELECT_MULT));
        this.starMinSize = Math.exp(loadGD(UI_STARMAP_STAR_MIN_SIZE));
    }

    prepareRenderFrameCache() {
        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
    }
}