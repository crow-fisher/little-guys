import { getCanvasHeight, getCanvasWidth } from "../canvas.js";
import { loadGD, UI_SH_MINSIZE, UI_SH_STYLE_SIZE_FACTOR , UI_SH_STYLE_BRIGHTNESS_FACTOR, UI_SH_STYLE_BRIGHTNESS_SHIFT,
UI_SH_STYLE_SIZE_SHIFT,
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
        this.UI_SH_STYLE_SIZE_FACTOR = loadGD(UI_SH_STYLE_SIZE_FACTOR);
        this.UI_SH_STYLE_BRIGHTNESS_FACTOR = loadGD(UI_SH_STYLE_BRIGHTNESS_FACTOR);
        this.UI_SH_STYLE_BRIGHTNESS_SHIFT = loadGD(UI_SH_STYLE_BRIGHTNESS_SHIFT);
        this.UI_SH_STYLE_SIZE_SHIFT = loadGD(UI_SH_STYLE_SIZE_SHIFT);
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