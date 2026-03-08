import { MAIN_CONTEXT } from "../../index.js";
import { hexToRgb, hsv2rgb, processColorLerpBicolor, rgb2hsv, rgbToHex, rgbToRgba } from "../../common.js";

import { getDaylightStrengthFrameDiff } from "../../climate/time.js";

import { RGB_COLOR_OTHER_BLUE, RGB_COLOR_RED, RGB_COLOR_GREEN } from "../../colors.js";
import { STAGE_DEAD } from "../../organisms/Stages.js";
import { getDefaultLighting, processLighting } from "../../lighting/lightingProcessing.js";
import { getBaseSize, getCurZoom, rotatePoint } from "../../canvas.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_POINT, UI_LIGHTING_ENABLED, UI_LIGHTING_PLANT, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NITROGEN, UI_VIEWMODE_NORMAL, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_WATERTICKRATE } from "../../ui/UIData.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../../rendering/camera.js";
import { addVec3Dest, crossVec3, normalizeVec3, subtractVectorsDest } from "../../climate/stars/matrix.js";
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

    getLsqRenderSizeMult() {
        if (this.type == "green") {
            return this.LSQ_RENDER_SIZE_MULT;
        } else {
            return 1;
        }
    }

    makeRandomsSimilar(otherSquare) {
        for (let i = 0; i < this.randoms.length; i++) {
            this.randoms[i] = otherSquare.randoms[i] * 0.9 + this.randoms[i] * 0.1;
        }
    }

    updatePositionDifferential(dx, dy) {
        this.posX += dx;
        this.posY += dy;
    }

    shiftUp() {
        this.updatePositionDifferential(0, -1);
    }

    dist(testX, testY) { // manhattan
        return Math.abs(this.posX - testX) + Math.abs(this.posY - testY);
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

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    calculateWidthXOffset() {
        return -(0.5 - (this.width / 2));
    }
    getPosX(xOffset = this.xOffset) {
        return this.posX - (this.deflectionXOffset + xOffset);
    }

    getPosY(yOffset = this.yOffset) {
        return this.posY - (this.deflectionYOffset + yOffset);
    }

    applySubtypeRenderConfig() {

    }

    processLightHealth(rgb) {
        let hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
        hsv[1] *= this.lightHealth;
        let rgbArr = hsv2rgb(...hsv);
        return { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] };
    }

    subtypeColorUpdate() {
        if (this.type == "root") {
            return;
        }

        this.applySubtypeRenderConfig();
        this.activeRenderSubtype = this.subtype;
        this.activeRenderState = this.state;
        this.prevLightHealth = this.lightHealth;
        this.baseColor_rgb = this.processLightHealth(hexToRgb(this.baseColor));
        this.darkColor_rgb = this.processLightHealth(hexToRgb(this.darkColor));
        this.accentColor_rgb = this.processLightHealth(hexToRgb(this.accentColor));
    }

    renderToCanvas() {
        if (this.type == "root")
            return;

        this.setFrameCartesians();
        this.prepareRenderJob();
        addRenderJob(this.renderJob, true);
    }

    render() {
        this.setFrameColor();
        this.setFrameOpacity();
        this.lightingUpdate();
        this.renderToCanvas();
    };

    setFrameColor() {
        this.frameViewMode = loadGD(UI_VIEWMODE_SELECT);
        switch (this.frameViewMode) {
            case UI_VIEWMODE_NITROGEN:
                return this.viewmodeNitrogen();
            case UI_VIEWMODE_LIGHTING:
                return this.viewmodeLighting();
            case UI_VIEWMODE_MOISTURE:
            case UI_VIEWMODE_WATERMATRIC:
            case UI_VIEWMODE_WATERTICKRATE:
                return this.viewmodeMoisture();
            case UI_VIEWMODE_EVOLUTION:
                return this.viewmodeEvolution();
            case UI_VIEWMODE_NUTRIENTS:
                return this.viewmodeNutrients();
            case UI_VIEWMODE_NORMAL:
            default:
                return this.viewmodeNormal();
        }
    }

    viewmodeNitrogen() { }
    viewmodeLighting() { }
    viewmodeMoisture() { }
    
    viewmodeEvolution() {
        this.evolutionColor = this.evolutionColor ?? this._getEvolutionColor();
        this.cachedRgba = rgbToRgba(...this.evolutionColor, this.opacity);
    }

    _getEvolutionColor(opacity) {
        return processColorLerpBicolor(this.linkedOrganism.evolutionMinColor, this.linkedOrganism.evolutionMaxColor, this.evolutionParameters.at(0), 1, opacity);
    }

    viewmodeNutrients() { }
    viewmodeNormal() { }

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




    unused() {
        let frameOpacity = this.opacity;
        if (this.lightHealth != this.prevLightHealth || this.activeRenderSubtype != this.subtype || this.activeRenderState != this.state) {
            this.subtypeColorUpdate();
        }
        let selectedViewMode = loadGD(UI_VIEWMODE_SELECT);
        if (selectedViewMode != UI_VIEWMODE_NORMAL && Math.random() > 0.97) {
            this.frameCacheLighting = null;
            this.processLighting();
        }
        if (selectedViewMode == UI_VIEWMODE_NITROGEN) {
            let color = {
                r: 100 + (1 - this.nitrogenIndicated) * 130,
                g: 100 + (1 - this.lightlevelIndicated) * 130,
                b: 100 + (1 - this.phosphorusIndicated) * 130
            }
            MAIN_CONTEXT.fillStyle = rgbToHex(color.r, color.g, color.b);
            return;
        }
        else if (selectedViewMode == UI_VIEWMODE_LIGHTING) {
            this.renderLighting();
        }
        else if (selectedViewMode == UI_VIEWMODE_MOISTURE || selectedViewMode == UI_VIEWMODE_WATERMATRIC || selectedViewMode == UI_VIEWMODE_WATERTICKRATE) {
            this.renderMoisture(frameOpacity);
        }
        else if (selectedViewMode == UI_VIEWMODE_EVOLUTION) {
            if (this.type == "green")
                MAIN_CONTEXT.fillStyle = this.linkedOrganism.getEvolutionColor(0.85);
            else
                MAIN_CONTEXT.fillStyle = this.linkedOrganism.getEvolutionColor(0.15);
            this.renderToCanvas();
            return;
        } else if (selectedViewMode == UI_VIEWMODE_NUTRIENTS) {
            let myhsv = structuredClone(NUTRIENT_BASE_HSV);
            let lli = Math.min(1, this.lightlevelIndicated);
            let hueShift = ((this.nitrogenIndicated + this.phosphorusIndicated) / 2) - lli;
            myhsv[0] += 60 * (hueShift)
            myhsv[1] = (this.nitrogenIndicated + this.phosphorusIndicated + lli) / 3;
            if (this.type == "green")
                MAIN_CONTEXT.fillStyle = rgbToRgba(...hsv2rgb(...myhsv), 0.8);
            else
                MAIN_CONTEXT.fillStyle = rgbToRgba(...hsv2rgb(...myhsv), 0.5);
            this.renderToCanvas();
            let outlineHsv = myhsv;
            outlineHsv[0] += 100;
            outlineHsv[1] /= 3;
            outlineHsv[2] /= 2;
            MAIN_CONTEXT.strokeStyle = rgbToRgba(...hsv2rgb(...outlineHsv), this.lifetimeIndicated);
            MAIN_CONTEXT.lineWidth = getBaseSize() * .15 * getCurZoom();
            MAIN_CONTEXT.stroke();

        }
        else {
            if (selectedViewMode == UI_VIEWMODE_NORMAL && this.type == "root")
                return;
            if (selectedViewMode == UI_VIEWMODE_ORGANISMS) {
                if (this.opacity < 0.235) {
                    frameOpacity *= 4;
                }
            }
            this.renderWithVariedColors(frameOpacity);
        }
    }
    renderLighting() {
        let frameOp = 0.5;
        if (this.type == "root") {
            frameOp = 0.25;
        }
        let myhsv = structuredClone(NUTRIENT_BASE_HSV);
        let hueShift = this.lightlevelIndicated;
        myhsv[0] += 60 * (hueShift)
        myhsv[1] = this.lightlevelIndicated;
        MAIN_CONTEXT.fillStyle = rgbToRgba(...hsv2rgb(...myhsv), frameOp);
        this.renderToCanvas();
    }

    renderMoisture(frameOpacity) {
        let color1 = null;
        let color2 = null;

        let val = this.linkedOrganism.getWilt();
        let valMin, valMax;

        if (val > 0) {
            color1 = RGB_COLOR_OTHER_BLUE;
            color2 = RGB_COLOR_GREEN;
            valMin = 0;
            valMax = 1;
        } else {
            color1 = RGB_COLOR_GREEN;
            color2 = RGB_COLOR_RED;
            valMin = -1;
            valMax = 0;
        }
        let valInvLerp = (val - valMin) / (valMax - valMin);
        let out = {
            r: color1.r * valInvLerp + color2.r * (1 - valInvLerp),
            g: color1.g * valInvLerp + color2.g * (1 - valInvLerp),
            b: color1.b * valInvLerp + color2.b * (1 - valInvLerp),
        }

        MAIN_CONTEXT.fillStyle = rgbToRgba(out.r, out.g, out.b, frameOpacity);
        this.renderToCanvas();
        return;
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

        this.cachedRgba = rgbToRgba(...this.color, this.opacity)
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