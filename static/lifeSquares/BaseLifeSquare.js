import { MAIN_CONTEXT } from "../index.js";
import { hexToRgb, hsv2rgb, rgb2hsv, rgbToHex, rgbToRgba, UI_BIGDOTSOLID } from "../common.js";

import { getDaylightStrengthFrameDiff } from "../climate/time.js";
import { addSquare } from "../squares/_sqOperations.js";

import { RGB_COLOR_OTHER_BLUE, RGB_COLOR_RED, RGB_COLOR_GREEN } from "../colors.js";
import { removeSquare } from "../globalOperations.js";
import { STATE_HEALTHY, STAGE_DEAD } from "../organisms/Stages.js";
import { getDefaultLighting, processLighting } from "../lighting/lightingProcessing.js";
import { getBaseSize, getCanvasHeight, getCanvasWidth, getCurZoom, zoomCanvasFillCircle, zoomCanvasFillRect, zoomCanvasFillRectTheta, zoomCanvasFillRectTheta3D, zoomCanvasSquareText } from "../canvas.js";
import { loadGD, UI_CANVAS_SQUARES_ZOOM, UI_LIGHTING_ENABLED, UI_LIGHTING_PLANT, UI_VIEWMODE_3D, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NITROGEN, UI_VIEWMODE_NORMAL, UI_VIEWMODE_NUTRIENTS, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_WATERTICKRATE } from "../ui/UIData.js";
import { cartesianToScreen } from "../camera.js";

export const LSQ_RENDERMODE_SQUARE = "LSQ_RENDERMODE_SQUARE";
export const LSQ_RENDERMODE_CIRCLE = "LSQ_RENDERMODE_CIRCLE";
export const LSQ_RENDERMODE_THETA = "LSQ_RENDERMODE_THETA";

const NUTRIENT_BASE_HSV = rgb2hsv(RGB_COLOR_GREEN.r, RGB_COLOR_GREEN.g, RGB_COLOR_GREEN.b);
class BaseLifeSquare {
    constructor(square, organism) {
        this.proto = "BaseLifeSquare";
        this.posX = square.posX;
        this.posY = square.posY;
        this.xOffset = 0;
        this.yOffset = 0;
        this.xRef = 0;
        this.yRef = 0;
        this.type = "base";
        this.subtype = "";
        this.theta = 0;

        this.lightHealth = 1;
        this.prevLightHealth = 1;

        this.baseColor = "#515c24";
        this.darkColor = "#353b1a";
        this.accentColor = "#5d6637";

        this.baseColor_rgb = hexToRgb(this.baseColor);
        this.darkColor_rgb = hexToRgb(this.darkColor);
        this.accentColor_rgb = hexToRgb(this.accentColor);

        this.baseColorAmount = 33;
        this.darkColorAmount = 33;
        this.accentColorAmount = 33;

        this.spawnTime = Date.now();

        this.deflectionStrength = 0;
        this.deflectionXOffset = 0;
        this.deflectionYOffset = 0;

        this.linkedSquare = square;
        this.linkedOrganism = organism;
        this.spawnedEntityId = organism.spawnedEntityId;
        this.childLifeSquares = new Array();

        if (square.organic) {
            square.spawnedEntityId = organism.spawnedEntityId;
            square.linkOrganismSquare(this);
        }

        this.strength = 1;

        this.state = STATE_HEALTHY;
        this.activeRenderState = null;

        this.opacity = 1;
        this.width = 1;
        this.height = 1;
        this.strength = 1;
        this.xOffset = 0; 
        this.zDelta = 0;
        this.randoms = [];

        this.cachedRgba = null;

        this.distToFront = 0;
        this.component = null;

        this.LSQ_RENDER_SIZE_MULT = Math.SQRT2;

        this.lighting = [];
        this.touchingGround = null;
        this.renderMode = LSQ_RENDERMODE_THETA;

        this.lsqLightDecayValue = 1;

        this.posVec = [this.posX, this.posY, square.z];
        this.rotVec = [0, 0, 0];
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
        removeSquare(this.linkedSquare);
        this.posX += dx;
        this.posY += dy;
        addSquare(this.linkedSquare);
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
        let root = cartesianToScreen(...this.posVec, 1);
        let cw = getCanvasWidth();
        let ch = getCanvasHeight();

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.arc((root[0] / root[2]) * cw, (root[1] / root[2]) * ch, 8, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
        MAIN_CONTEXT.stroke();

        return;
        if (this.renderMode == LSQ_RENDERMODE_THETA) {
            let func = zoomCanvasFillRectTheta; 

            if (loadGD(UI_VIEWMODE_SELECT) == UI_VIEWMODE_3D)
                func = zoomCanvasFillRectTheta3D;

            func(
                this.getPosX() * getBaseSize() - getBaseSize() * this.calculateWidthXOffset(),
                this.getPosY() * getBaseSize(),
                this.width * getBaseSize() * this.getLsqRenderSizeMult(),
                this.height * getBaseSize() * this.getLsqRenderSizeMult(),
                this.xRef,
                this.yRef,
                this.theta, 
                this.linkedOrganism.linkedSquare.z 
            );
        } else if (this.renderMode == LSQ_RENDERMODE_CIRCLE) {
            zoomCanvasFillCircle(
                (this.getPosX() + 0.5) * getBaseSize(),
                (this.getPosY() + 0.5) * getBaseSize(),
                this.width * getBaseSize() / 2
            );
        } else {
            zoomCanvasFillRect(
                this.getPosX() * getBaseSize(),
                this.getPosY() * getBaseSize(),
                this.width * getBaseSize() * this.getLsqRenderSizeMult(),
                this.height * getBaseSize() * this.getLsqRenderSizeMult()
            );
        }
    }

    render() {
        let frameOpacity = this.opacity;
        if (this.lightHealth != this.prevLightHealth || this.activeRenderSubtype != this.subtype || this.activeRenderState != this.state) {
            this.subtypeColorUpdate();
        }
        if (this.linkedOrganism.stage == STAGE_DEAD) {
            frameOpacity *= (1 - this.linkedOrganism.deathProgress ** 6);
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
            if (this.linkedSquare != null) {
                this.frameCacheLighting = (this.linkedSquare.frameCacheLighting ?? getDefaultLighting());
            } else {
                this.linkedOrganism.removeAssociatedLifeSquare(this);
                return getDefaultLighting();
            }
        }
        else
            this.frameCacheLighting = processLighting(this.lighting);
        return this.frameCacheLighting;
    }

    renderWithVariedColors(frameOpacity = 1) {
        let minTime = 2000;
        // if (isSqColChanged(Math.floor(this.getPosX()))) {
        //     minTime /= 4;
        // }
        // if (isSqRowChanged(Math.floor(this.getPosY()))) {
        //     minTime /= 4;
        // }

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