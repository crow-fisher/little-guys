import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, getCurZoom, zoomCanvasFillCircle } from "../../canvas.js";
import { copyVecValue, getVec3Length, subtractVectorsDest } from "../../climate/stars/matrix.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth } from "../../index.js";
import { loadEmptyScene } from "../../saveAndLoad.js";
import { loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_VIEWMODE_3D, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT } from "../../ui/UIData.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../camera.js";

export class CoordinateSet {
    constructor(world) {
        this.world = [0, 0, 0];
        this.offset = [0, 0, 0];
        this.camera = [0, 0, 0];
        this.screen = [0, 0, 0];
        this.renderNorm = [0, 0];
        this.renderScreen = [0, 0, 0];
        this.distToCamera = 0;
        
        if (world != null) {
            copyVecValue(world, this.world)
            this.process();
        }
    }

    setWorld(newWorld) {
        copyVecValue(newWorld, this.world);
        this.process();
    }

    process() {
        if (loadGD(UI_VIEWMODE_SELECT) != UI_VIEWMODE_NORMAL) {
            subtractVectorsDest(this.world, gfc().cameraOffset, this.offset);
            cartesianToScreenInplace(this.offset, this.camera, this.screen);
            screenToRenderScreen(this.screen, this.renderNorm, this.renderScreen,
                gfc()._xOffset, gfc()._yOffset, gfc()._s);
            this.distToCamera = getVec3Length(this.offset);
        } else {
            this.process2D();
        }
    }

    isVisibleOnScreen() {
        return true;
        return this.renderScreen[0] > 0 &&
                this.renderScreen[0] < getTotalCanvasPixelWidth() * 10 &&
                this.renderScreen[1] > 0 && 
                this.renderScreen[1] < getTotalCanvasPixelHeight() * 10 && 
                this.renderScreen[2] > 0
    }

    process2D() {
        copyVecValue(this.canvasLocToPixels(this.world[0] * getBaseSize(), this.world[1] * getBaseSize()), this.renderScreen);
        this.renderScreen[2] = 1;
    }
    canvasLocToPixels(x, y) {
        this._cz = getCurZoom();
        this._ccx = loadGD(UI_CANVAS_VIEWPORT_CENTER_X);
        this._ccy = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y);
        this._tw = getCanvasSquaresX() * getBaseSize();
        this._th = getCanvasSquaresY() * getBaseSize();
        this._ww = this._tw / getCurZoom();
        this._wh = this._th / getCurZoom();
        this._wws = this._ccx - (this._ww / 2);
        this._whs = this._ccy - (this._wh / 2);
        this._wwe = this._ccx + (this._ww / 2);
        this._whe = this._ccy + (this._wh / 2);
        this._xpi = (x - this._wws) / this._ww;
        this._ypi = (y - this._whs) / this._wh;
        return [this._xpi * this._tw, this._ypi * this._th];
    }

}