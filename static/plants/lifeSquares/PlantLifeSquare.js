import { hsv2rgb, processColorLerpBicolorArr, processRangeToOne, rgb2hsv, rgbToRgba } from "../../common.js";
import { RGB_COLOR_GREEN } from "../../colors.js";
import { getDefaultLighting, processLighting } from "../../lighting/lightingProcessing.js";
import { rotatePoint } from "../../canvas.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_POINT, UI_CAMERA_OFFSET_VEC, UI_LIGHTING_ENABLED, UI_LIGHTING_PLANT, UI_VIEWMODE_3D, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_WATERTICKRATE } from "../../ui/UIData.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../../rendering/camera.js";
import { addVec3Dest, addVectors, copyVecValue, crossVec3, multiplyVectorByScalar, multiplyVectorsDest, normalizeVec3, normalizeVec3Dest, subtractVectors, subtractVectorsDest } from "../../climate/stars/matrix.js";
import { QuadRenderJob } from "../../rendering/model/QuadRenderJob.js";
import { addRenderJob } from "../../rendering/rasterizer.js";
import { STAGE_DEAD } from "../organisms/Stages.js";

const NUTRIENT_BASE_HSV = rgb2hsv(RGB_COLOR_GREEN.r, RGB_COLOR_GREEN.g, RGB_COLOR_GREEN.b);
class PlantLifeSquare {
    constructor(organism) {
        this.proto = "PlantLifeSquare";
        this.linkedOrganism = organism;
        this.spawnTime = Date.now();
        // RGB Array
        this.color = [100, 100, 100];
        this.altColor = [255, 0, 0];
        this.colorLightingApplied = [0, 0, 0];
        this.opacity = 1;
        // RGBA String
        this.cachedRgba = null;

        this.frameCacheLighting = getDefaultLighting();
        this.lighting = []

        // Set rendering member variables.
        this.width = 1;
        this.height = 1;

        this.posVec = [0, 0, 0];
        this.posVecDir = [0, 0, 0];

        // Derived rendering member variables.
        this.rootPositionVec = [0, 0, 0];
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
        this.offset = [0, 0, 0]
        subtractVectorsDest(this.rootPositionVec, gfc().cameraOffset, this.startPointVec);
        
        copyVecValue(this.posVecDir, this.offset);
        multiplyVectorByScalar(this.offset, this.height);
        addVec3Dest(this.startPointVec, this.offset, this.endPointVec);

        this.forwardVec = normalizeVec3(this.startPointVec);
        this.sideVec = normalizeVec3(crossVec3(this.offset, this.forwardVec))

        multiplyVectorByScalar(this.sideVec, this.width / 2);

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
        this.centerZ = (this.renderScreen_tl[2] + this.renderScreen_bl[2] + this.renderScreen_br[2] + this.renderScreen_tr[2]) / 4;
        if (this.renderJob == null) {
            this.renderJob = new QuadRenderJob(
                this.renderScreen_tl, 
                this.renderScreen_bl, 
                this.renderScreen_br, 
                this.renderScreen_tr, this.cachedRgba, this.centerZ)
        } else {
            this.renderJob.renderScreen_tl = this.renderScreen_tl;
            this.renderJob.renderScreen_bl = this.renderScreen_bl;
            this.renderJob.renderScreen_br = this.renderScreen_br;
            this.renderJob.renderScreen_tr = this.renderScreen_tr;
            this.renderJob.color = this.cachedRgba;
            this.renderJob.z = this.centerZ;
        }
    }

    getSurfaceLightingFactor() {
        return 1;
    }

    getLightFilterRate() {
        return processRangeToOne(loadGD(UI_LIGHTING_PLANT)) * this.linkedOrganism.lightDecayValue();
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
        this.linkedSquare = null;
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

        if (this.posVecDir == null) {
            return;
        }

        this.lightingUpdate();
        this.setFrameOpacity();
        this.setFrameRenderColor();
        this.setFrameAltColor();
        this.renderToCanvas();
    };

    setFrameOpacity() {
        this.frameOpacity = 1;
        if (this.linkedOrganism.stage == STAGE_DEAD) {
            this.frameOpacity *= (1 - this.linkedOrganism.deathProgress ** 6);
        }
    }
    
    setFrameRenderColor() {
        if (this.frameViewMode == UI_VIEWMODE_3D) {

        this.colorLighting = this.processLighting();
        this.colorLightingApplied[0] = (this.color[0] / 255) * this.colorLighting.r;
        this.colorLightingApplied[1] = (this.color[1] / 255) * this.colorLighting.g;
        this.colorLightingApplied[2] = (this.color[2] / 255) * this.colorLighting.b;

        this.cachedRgba = rgbToRgba(...this.colorLightingApplied, this.opacity);
        } else {
            this.cachedRgba = rgbToRgba(...this.altColor, this.opacity);
        }
    }

    setFrameAltColor() {
        this.frameViewMode = loadGD(UI_VIEWMODE_SELECT);
        switch (this.frameViewMode) {
            case UI_VIEWMODE_ORGANISMS:
                return this.viewmodeOrganisms();
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

    viewmodeOrganisms() {
        this.organismsColor = processColorLerpBicolorArr(this.growthLevelIndicated, 0, 1, this.linkedOrganism.moistureMinColor, this.linkedOrganism.moistureMaxColor);
        this.altColor = this.organismsColor;
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
        this.moistureColor = processColorLerpBicolorArr(this.linkedOrganism.getWilt(), -1, 1, this.linkedOrganism.moistureMinColor, this.linkedOrganism.moistureMaxColor);
        this.altColor = this.moistureColor;
    }
    
    viewmodeEvolution() {
        this.evolutionColor = this.evolutionColor ?? processColorLerpBicolorArr(this.linkedOrganism.evolutionParameters.at(0), 0, 1, this.linkedOrganism.evolutionMinColor, this.linkedOrganism.evolutionMaxColor);
        this.altColor = this.evolutionColor;
    }

    lightingUpdate() {
        this.frameCacheLighting = null;
        this.processLighting();
    }

    processLighting() {
        if (this.frameCacheLighting != null) {
            return this.frameCacheLighting;
        }
        if (!loadGD(UI_LIGHTING_ENABLED)) {
            this.frameCacheLighting = getDefaultLighting();
            return this.frameCacheLighting;
        }
        else
            this.frameCacheLighting = processLighting(this.lighting);
    }

}
export { PlantLifeSquare };