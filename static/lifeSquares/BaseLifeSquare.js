import { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, zoomCanvasFillRect } from "../index.js";
import { getZPercent, hexToRgb, processColorLerp, processColorStdev, processLighting, rgbToHex, rgbToRgba } from "../common.js";

import { getCurTime, getDaylightStrength } from "../time.js";
import { dirt_baseColorAmount, dirt_darkColorAmount, dirt_accentColorAmount, b_sq_darkeningStrength } from "../config/config.js";
import { addSquare, getSquares, removeOrganismSquare } from "../squares/_sqOperations.js";
import { airNutrientsPerEmptyNeighbor } from "../config/config.js";

import { selectedViewMode } from "../index.js";
import { RGB_COLOR_BLUE, RGB_COLOR_BROWN, RGB_COLOR_OTHER_BLUE, RGB_COLOR_BLACK, RGB_COLOR_RED, COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_RED } from "../colors.js";
import { addOrganismSquare } from "./_lsOperations.js";
import { removeSquare } from "../globalOperations.js";
import { STATE_DEAD, STATE_HEALTHY, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_DEAD, SUBTYPE_LEAF, SUBTYPE_LEAFSTEM, SUBTYPE_NODE, SUBTYPE_ROOTNODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM } from "../organisms/Stages.js";
import { lightingRegisterLifeSquare } from "../lighting.js";


class BaseLifeSquare {
    constructor(square, organism) {
        this.proto = "BaseLifeSquare";
        this.posX = square.posX;
        this.posY = square.posY;
        this.xOffset = 0;
        this.yOffset = 0;
        this.type = "base";
        this.subtype = "";
        this.colorBase = "#1D263B";
        this.spawnTime = getCurTime();
        this.collision = false;

        this.maxAirDt = 0.005;
        this.maxWaterDt = 0.005;
        this.maxDirtDt = 0.005;

        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.dirtNutrients = 0;

        this.deflectionStrength = 0;
        this.deflectionXOffset = 0;
        this.deflectionYOffset = 0;

        this.linkedSquare = square;
        this.linkedOrganism = organism;
        this.spawnedEntityId = organism.spawnedEntityId;
        this.childLifeSquares = new Array();

        this.height = BASE_SIZE;

        if (square.organic) {
            square.spawnedEntityId = organism.spawnedEntityId;
        }

        this.strength = 1;

        this.state = STATE_HEALTHY;
        this.activeRenderState = null;

        this.opacity = 1;
        this.width = 1;
        this.height = 1;
        this.xOffset = 0;
        this.randoms = [];

        this.cachedRgba = null;

        this.distToFront = 0;
        this.component = null;

        this.baseColor = "#9A8873";
        this.baseColorAmount = dirt_baseColorAmount;
        this.darkColor = "#46351D";
        this.darkColorAmount = dirt_darkColorAmount;
        this.accentColor = "#246A73";
        this.accentColorAmount = dirt_accentColorAmount;

        this.LSQ_RENDER_SIZE_MULT = Math.SQRT2;

        this.lightFilterRate = 0.00035;

        if (square.lighting != null && square.lighting.length > 0) {
            this.lighting = square.lighting;
        } else if (organism.linkedSquare.lighting != null && organism.linkedSquare.lighting.length > 0) {
            this.lighting = organism.linkedSquare.lighting;
        } else {
            this.lighting = [];
        }

    }

    getLightFilterRate() {
        return this.lightFilterRate;
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
        removeOrganismSquare(this);
        removeSquare(this.linkedSquare);
        this.posX += dx;
        this.posY += dy;
        addOrganismSquare(this);
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
        removeOrganismSquare(this);
    }

    getStaticRand(randIdx) {
        while (randIdx > this.randoms.length - 1) {
            this.randoms.push(Math.random());
        }
        return this.randoms[randIdx];
    }

    getPosX() {
        return this.posX - (this.deflectionXOffset + this.xOffset);
    }

    getPosY() {
        return this.posY - (this.deflectionYOffset + this.yOffset);
    }

    subtypeColorUpdate() {
        if (this.type == "root") {
            return;
        }
        if (this.state == STATE_DEAD) {
            this.baseColor = "#70747e";
            this.darkColor = "#a1816d";
            this.accentColor = "#33261d";
        } else if (this.state == STATE_THIRSTY) {
            this.baseColor = "#6a7831";
            this.darkColor = "#4a5226";
            this.accentColor = "#67703f";
        } else {
            switch (this.subtype) {
                case SUBTYPE_TRUNK:
                case SUBTYPE_SHOOT:
                case SUBTYPE_SPROUT:
                case SUBTYPE_STEM:
                case SUBTYPE_NODE:
                    this.baseColor = "#515c24";
                    this.darkColor = "#353b1a";
                    this.accentColor = "#5d6637";
                    break;
                default:
                    console.warn("BIPPITY BOPPITY")
            }
        }
        this.activeRenderSubtype = this.subtype;
        this.activeRenderState = this.state;
        this.baseColor_rgb = hexToRgb(this.baseColor);
        this.darkColor_rgb = hexToRgb(this.darkColor);
        this.accentColor_rgb = hexToRgb(this.accentColor);
    }

    render() {
        if (this.activeRenderSubtype != this.subtype || this.activeRenderState != this.state) {
            this.subtypeColorUpdate();
        }
        if (selectedViewMode == "organismNutrients") {
            let color = {
                r: 100 + (1 - this.nitrogenIndicated) * 130,
                g: 100 + (1 - this.lightlevelIndicated) * 130,
                b: 100 + (1 - this.phosphorusIndicated) * 130
            }
            MAIN_CONTEXT.fillStyle = rgbToHex(color.r, color.g, color.b);
            zoomCanvasFillRect(
                this.getPosX() * BASE_SIZE,
                this.getPosY() * BASE_SIZE,
                this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                this.height * BASE_SIZE * this.getLsqRenderSizeMult()
            );
            return;
        }
        else if (selectedViewMode == "watersaturation") {
            var color1 = null;
            var color2 = null;

            var val = this.linkedOrganism.waterPressure;
            var valMin = -100;
            var valMax = 0;

            if (this.linkedOrganism.waterPressure > -2) {
                color1 = RGB_COLOR_BLUE;
                color2 = RGB_COLOR_OTHER_BLUE;
                valMin = this.linkedOrganism.waterPressureTarget;
                valMax = this.linkedOrganism.waterPressureOverwaterThresh;

            } else if (this.linkedOrganism.waterPressure > this.linkedOrganism.waterPressureWiltThresh) {
                color1 = RGB_COLOR_OTHER_BLUE;
                color2 = RGB_COLOR_BROWN;
                valMin = this.linkedOrganism.waterPressureWiltThresh;
                valMax = this.linkedOrganism.waterPressureTarget;
            } else {
                color1 = RGB_COLOR_BROWN;
                color2 = RGB_COLOR_RED;
                valMin = this.linkedOrganism.waterPressureDieThresh;
                valMax = this.linkedOrganism.waterPressureWiltThresh;
            }


            val = Math.max(valMin, val);
            val = Math.min(valMax, val);

            var valInvLerp = (val - valMin) / (valMax - valMin);
            var out = {
                r: color1.r * valInvLerp + color2.r * (1 - valInvLerp),
                g: color1.g * valInvLerp + color2.g * (1 - valInvLerp),
                b: color1.b * valInvLerp + color2.b * (1 - valInvLerp),
            }


            MAIN_CONTEXT.fillStyle = rgbToRgba(out.r, out.g, out.b, this.opacity);
            zoomCanvasFillRect(
                this.getPosX() * BASE_SIZE,
                this.getPosY() * BASE_SIZE,
                this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                this.height * BASE_SIZE * this.getLsqRenderSizeMult()
            );
            return;
        }
        else {
            var res = this.getStaticRand(1) * (parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value) + parseFloat(this.baseColorAmount.value));
            var primaryColor = null;
            var altColor1 = null;
            var altColor2 = null;
            if (res < parseFloat(this.accentColorAmount.value)) {
                primaryColor = this.accentColor;
                altColor1 = this.darkColor;
                altColor2 = this.colorBase;
            } else if (res < parseFloat(this.accentColorAmount.value) + parseFloat(this.darkColorAmount.value)) {
                primaryColor = this.darkColor;
                altColor1 = this.baseColor;
                altColor2 = this.darkColor;
            } else {
                altColor1 = this.darkColor;
                altColor2 = this.darkColor;
                primaryColor = this.baseColor;
            }

            var rand = this.getStaticRand(2);
            var baseColorRgb = hexToRgb(primaryColor);
            var altColor1Rgb = hexToRgb(altColor1);
            var altColor2Rgb = hexToRgb(altColor2);

            // the '0.1' is the base darkness
            var outColorBase = {
                r: (baseColorRgb.r * 0.5 + ((altColor1Rgb.r * rand + altColor2Rgb.r * (1 - rand)) * 0.5)),
                g: (baseColorRgb.g * 0.5 + ((altColor1Rgb.g * rand + altColor2Rgb.g * (1 - rand)) * 0.5)),
                b: (baseColorRgb.b * 0.5 + ((altColor1Rgb.b * rand + altColor2Rgb.b * (1 - rand)) * 0.5))
            }
            var lightingColor = processLighting(this.lighting);
            var outColor = { r: lightingColor.r * outColorBase.r / 255, g: lightingColor.g * outColorBase.g / 255, b: lightingColor.b * outColorBase.b / 255 };
            var outRgba = rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), this.opacity);
            MAIN_CONTEXT.fillStyle = outRgba;

            zoomCanvasFillRect(
                this.getPosX() * BASE_SIZE,
                this.getPosY() * BASE_SIZE,
                this.width * BASE_SIZE * this.getLsqRenderSizeMult(),
                this.height * BASE_SIZE * this.getLsqRenderSizeMult()
            );
        }

    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
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