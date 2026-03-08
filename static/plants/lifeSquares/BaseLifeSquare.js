import { MAIN_CONTEXT } from "../../index.js";
import { hexToRgb, hsv2rgb, processColorLerpBicolorArr, rgb2hsv, rgbToHex, rgbToRgba } from "../../common.js";

import { getDaylightStrengthFrameDiff } from "../../climate/time.js";

import { RGB_COLOR_GREEN } from "../../colors.js";
import { STAGE_DEAD } from "../../organisms/Stages.js";
import { getDefaultLighting, processLighting } from "../../lighting/lightingProcessing.js";
import { rotatePoint } from "../../canvas.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_POINT, UI_LIGHTING_ENABLED, UI_LIGHTING_PLANT, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_WATERTICKRATE } from "../../ui/UIData.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../../rendering/camera.js";
import { addVec3Dest, crossVec3, multiplyVectorByScalar, multiplyVectorsDest, normalizeVec3, subtractVectorsDest } from "../../climate/stars/matrix.js";
import { QuadRenderJob } from "../../rendering/model/QuadRenderJob.js";
import { addRenderJob } from "../../rendering/rasterizer.js";

export const LSQ_RENDERMODE_SQUARE = "LSQ_RENDERMODE_SQUARE";
export const LSQ_RENDERMODE_CIRCLE = "LSQ_RENDERMODE_CIRCLE";
export const LSQ_RENDERMODE_THETA = "LSQ_RENDERMODE_THETA";

const NUTRIENT_BASE_HSV = rgb2hsv(RGB_COLOR_GREEN.r, RGB_COLOR_GREEN.g, RGB_COLOR_GREEN.b);
class BaseLifeSquare {
    constructor(organism) {
        this.proto = "BaseLifeSquare";
        this.linkedOrganism = organism;
        this.spawnTime = Date.now();
        // RGB Array
        this.color = [100, 100, 100];
        this.altColor = [255, 0, 0];
        this.colorLightingApplied = [0, 0, 0];
        this.opacity = 1;
        // RGBA String
        this.cachedRgba = null;

        this.lighting = [];

        // Set rendering member variables.
        this.width = 1;
        this.height = 1;

        this.posVec = [0, 0, 0];
        this.rotVec = [0, 0, 0];

        // Derived rendering member variables.
        this.startPointVec = [0, 0, 0];
        this.endPointVec = [0, 0, 0];
        this.forwardVec = [0, 0, 0];
        this.sideVec = [0, 0, 0];
        this.offsetCrossForwardVec = [0, 0, 0];

        this.cartesian_tl = [0, 0, 0];
        this.cartesian_tr = [0, 0, 0];
        this.cartesian_bl = [0, 0, 0];
        this.cartesian_br = [0, 0, 0];

        this.camera_tl = [0, 0, 0];
        this.camera_tr = [0, 0, 0];
        this.camera_bl = [0, 0, 0];
        this.camera_br = [0, 0, 0];

        this.screen_tl = [0, 0, 0];
        this.screen_tr = [0, 0, 0];
        this.screen_bl = [0, 0, 0];
        this.screen_br = [0, 0, 0];

        this.renderNorm_tl = [0, 0];
        this.renderNorm_tr = [0, 0];
        this.renderNorm_bl = [0, 0];
        this.renderNorm_br = [0, 0];

        this.renderScreen_tl = [0, 0, 0];
        this.renderScreen_tr = [0, 0, 0];
        this.renderScreen_bl = [0, 0, 0];
        this.renderScreen_br = [0, 0, 0];
    }

    setFrameCartesians() {
        this.offsetVec = [0, 1, 0, 0];
        this.rotatedOffset = rotatePoint(this.offsetVec, ...this.rotVec);
        this._centerPointRef = loadGD(UI_CAMERA_CENTER_SELECT_POINT);

        subtractVectorsDest(this.posVec, gfc().cameraOffset, this.startPointVec);
        subtractVectorsDest(this.startPointVec, loadGD(UI_CAMERA_CENTER_SELECT_POINT), this.startPointVec);
        addVec3Dest(this.startPointVec, this.rotatedOffset, this.endPointVec);

        this.forwardVec = normalizeVec3(this.startPointVec);
        this.sideVec = normalizeVec3(crossVec3(this.rotatedOffset, this.forwardVec))

        subtractVectorsDest(this.endPointVec, this.sideVec, this.cartesian_tl);
        addVec3Dest(this.endPointVec, this.sideVec, this.cartesian_tr);
        subtractVectorsDest(this.startPointVec, this.sideVec, this.cartesian_bl);
        addVec3Dest(this.startPointVec, this.sideVec, this.cartesian_br);

        cartesianToScreenInplace(this.cartesian_tl, this.camera_tl, this.screen_tl);
        cartesianToScreenInplace(this.cartesian_tr, this.camera_tr, this.screen_tr);
        cartesianToScreenInplace(this.cartesian_bl, this.camera_bl, this.screen_bl);
        cartesianToScreenInplace(this.cartesian_br, this.camera_br, this.screen_br);

        screenToRenderScreen(this.screen_tl, this.renderNorm_tl, this.renderScreen_tl, gfc()._xOffset, gfc()._yOffset, gfc()._s);
        screenToRenderScreen(this.screen_tr, this.renderNorm_tr, this.renderScreen_tr, gfc()._xOffset, gfc()._yOffset, gfc()._s);
        screenToRenderScreen(this.screen_bl, this.renderNorm_bl, this.renderScreen_bl, gfc()._xOffset, gfc()._yOffset, gfc()._s);
        screenToRenderScreen(this.screen_br, this.renderNorm_br, this.renderScreen_br, gfc()._xOffset, gfc()._yOffset, gfc()._s);
    }

    prepareRenderJob() {
        this.tl = structuredClone(this.renderScreen_tl);
        this.bl = structuredClone(this.renderScreen_bl);
        this.br = structuredClone(this.renderScreen_br);
        this.tr = structuredClone(this.renderScreen_tr);

        this.centerZ = (this.tl[2] + this.bl[2] + this.br[2] + this.tr[2]) / 4;

        if (this.renderJob == null) {
            this.renderJob = new QuadRenderJob(this.tl, this.bl, this.br, this.tr, this.cachedRgba, this.centerZ)
        } else {
            this.renderJob.tl = this.tl;
            this.renderJob.bl = this.bl;
            this.renderJob.br = this.br;
            this.renderJob.tr = this.tr;
            this.renderJob.color = this.cachedRgba;
            this.renderJob.z = this.centerZ;
        }
    }

    getSurfaceLightingFactor() {
        return Math.max(0, loadGD(UI_LIGHTING_PLANT));
    }

    getLightFilterRate() {
        return 0.00023 * (this.height ** 2) * (this.width ** 2) * Math.exp(this.linkedOrganism.lightDecayValue()) * this.lsqLightDecayValue;
    }

    addChild(lifeSquare) {
        lifeSquare.deflectionXOffset = this.deflectionXOffset;
        lifeSquare.deflectionYOffset = this.deflectionYOffset;
        lifeSquare.lighting = this.lighting;
    }

    removeChild(lifeSquare) {
        this.childLifeSquares = Array.from(this.childLifeSquares.filter((lsq) => lsq != lifeSquare));
    }

    linkSquare(square) {
        this.linkedSquare = square;
    }
    unlinkSquare() {
        this.linkedSquare = null;
    }
    destroy() {
        if (this.linkedSquare != null) {
            if (this.linkedSquare.organic) {
                this.linkedSquare.destroy();
            } else {
                this.linkedSquare.unlinkOrganismSquare(this);
            }
        }
        this.lighting = [];
    }

    renderToCanvas() {
        if (this.type == "root")
            return;

        this.setFrameCartesians();
        this.prepareRenderJob();
        addRenderJob(this.renderJob, true);
    }

    render() {
        this.setFrameAltColor();
        this.setFrameOpacity();
        this.setFrameRenderColor();
        this.lightingUpdate();
        this.renderToCanvas();
    };

    setFrameAltColor() {
        this.frameViewMode = loadGD(UI_VIEWMODE_SELECT);
        switch (this.frameViewMode) {
            case UI_VIEWMODE_LIGHTING:
                return this.viewmodeLighting();
            case UI_VIEWMODE_MOISTURE:
            case UI_VIEWMODE_WATERMATRIC:
            case UI_VIEWMODE_WATERTICKRATE:
                return this.viewmodeMoisture();
            case UI_VIEWMODE_EVOLUTION:
                return this.viewmodeEvolution();
            default:
                return
        }
    }

    setFrameRenderColor() {
        if (this.frameViewMode == UI_VIEWMODE_NORMAL) {
            multiplyVectorsDest(this.color, this.lightingColor, this.colorLightingApplied);
            this.cachedRgba = rgbToRgba(...this.colorLightingApplied, this.opacity);
        } else {
            this.cachedRgba = rgbToRgba(...this.altColor, this.opacity);
        }
    }

    viewmodeLighting() {
        let frameOp = 0.5;
        if (this.type == "root") {
            frameOp = 0.25;
        }
        let myhsv = structuredClone(NUTRIENT_BASE_HSV);
        let hueShift = this.lightlevelIndicated;
        myhsv[0] += 60 * (hueShift)
        myhsv[1] = this.lightlevelIndicated;

        this.lightingColor = hsv2rgb(...myhsv), frameOp;
        this.altColor = this.lightingColor;
    }
    viewmodeMoisture() {
        this.moistureColor = processColorLerpBicolorArr(this.linkedOrganism.getWilt(), -1, 1, this.linkedOrganism.moistureMinColor, this.linkedOrganism.moistureMaxColor, this.evolutionParameters.at(0), 1, opacity);
        this.altColor = this.moistureColor;
    }
    
    viewmodeEvolution() {
        this.evolutionColor = this.evolutionColor ?? processColorLerpBicolorArr(this.linkedOrganism.evolutionMinColor, this.linkedOrganism.evolutionMaxColor, this.evolutionParameters.at(0), 1, opacity);
        this.altColor = this.evolutionColor;
    }

    setFrameOpacity() {
        this.frameOpacity = 1;
        if (this.linkedOrganism.stage == STAGE_DEAD) {
            this.frameOpacity *= (1 - this.linkedOrganism.deathProgress ** 6);
        }
    }

    lightingUpdate() {
        if (Math.random() > 0.97) {
            this.frameCacheLighting = null;
            this.processLighting();
        }
    }

    processLighting() {
        if (this.frameCacheLighting != null) {
            return this.frameCacheLighting;
        }
        if (!loadGD(UI_LIGHTING_ENABLED)) {
            this.frameCacheLighting = getDefaultLighting();
            return this.frameCacheLighting;
        }
        if (this.type == "root") {
            this.frameCacheLighting = (this.linkedSquare.frameCacheLighting ?? getDefaultLighting());
        }
        else
            this.frameCacheLighting = processLighting(this.lighting);
    }

    frameColorUpdate(frameOpacity = 1) {
        let minTime = 2000;
        if (
            (frameOpacity != this.lastColorCacheOpacity) ||
            (Date.now() > this.lastColorCacheTime + minTime * Math.random()) ||
            Math.abs(getDaylightStrengthFrameDiff()) > 0.01) {
            this.lastColorCacheTime = Date.now();
            this.lastColorCacheOpacity = frameOpacity;
            let res = this.getStaticRand(1) * this.accentColorAmount + this.darkColorAmount + this.baseColorAmount;
            let baseColor = null;
            let altColor1 = null;
            let altColor2 = null;
            if (res < this.accentColorAmount) {
                baseColor = this.accentColor_rgb;
                altColor1 = this.darkColor_rgb;
                altColor2 = this.baseColor_rgb;
            } else if (res < this.accentColorAmount + this.darkColorAmount) {
                baseColor = this.accentColor_rgb;
                altColor1 = this.baseColor_rgb;
                altColor2 = this.darkColor_rgb;
            } else {
                altColor1 = this.accentColor_rgb;
                altColor2 = this.darkColor_rgb;
                baseColor = this.baseColor_rgb;
            }

            let rand = this.getStaticRand(2);
            // the '0.1' is the base darkness
            let outColorBase = {
                r: (baseColor.r * 0.5 + ((altColor1.r * rand + altColor2.r * (1 - rand)) * 0.5)),
                g: (baseColor.g * 0.5 + ((altColor1.g * rand + altColor2.g * (1 - rand)) * 0.5)),
                b: (baseColor.b * 0.5 + ((altColor1.b * rand + altColor2.b * (1 - rand)) * 0.5))
            }
            this.frameCacheLighting = null;
            let lightingColor = this.processLighting();
            let frameLightingOffset = Math.exp(this.linkedOrganism.lightLevelDisplayExposureAdjustment());
            let outColor = {
                r: (frameLightingOffset * lightingColor.r) * outColorBase.r / 255,
                g: (frameLightingOffset * lightingColor.g) * outColorBase.g / 255,
                b: (frameLightingOffset * lightingColor.b) * outColorBase.b / 255
            };
            this.cachedRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), frameOpacity);
        }
    }

    renderWithVariedColors(frameOpacity = 1) {
        this.frameColorUpdate(frameOpacity);
        MAIN_CONTEXT.fillStyle = this.cachedRgba;
        this.renderToCanvas();
    }

    calculateColor() {
        let baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }

    setSpawnedEntityId(id) {
        this.spawnedEntityId = id;
        if (this.linkedSquare != null) {
            this.linkedSquare.spawnedEntityId = id;
        }
    }

    getMinNutrient() {
        return Math.min(Math.min(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }

    getMaxNutrient() {
        return Math.max(Math.max(this.airNutrients, this.dirtNutrients), this.waterNutrients);
    }
    getMeanNutrient() {
        return (this.airNutrients + this.dirtNutrients + this.waterNutrients) / 3;
    }

}
export { BaseLifeSquare };