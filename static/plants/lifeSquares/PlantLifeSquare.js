import { hsv2rgb, processColorLerpBicolorArr, processRangeToOne, rgb2hsv, rgbToRgba } from "../../common.js";
import { COLOR_BLUE, RGB_COLOR_GREEN } from "../../colors.js";
import { getDefaultLighting, processLighting } from "../../lighting/lightingProcessing.js";
import { rotatePoint } from "../../canvas.js";
import { loadGD, UI_CAMERA_CENTER_SELECT_POINT, UI_CAMERA_OFFSET_VEC, UI_LIGHTING_ENABLED, UI_LIGHTING_PLANT, UI_VIEWMODE_3D, UI_VIEWMODE_EVOLUTION, UI_VIEWMODE_LIGHTING, UI_VIEWMODE_MOISTURE, UI_VIEWMODE_NORMAL, UI_VIEWMODE_ORGANISMS, UI_VIEWMODE_SELECT, UI_VIEWMODE_WATERMATRIC, UI_VIEWMODE_WATERTICKRATE } from "../../ui/UIData.js";
import { cartesianToScreenInplace, gfc, screenToRenderScreen } from "../../rendering/camera.js";
import { addVec3Dest, addVectors, copyVecValue, crossVec3, vec3Dot, multiplyVectorByScalar, multiplyVectorByScalarDest, multiplyVectorsDest, normalizeVec3, normalizeVec3Dest, subtractVectors, subtractVectorsDest, subtractVectorsMultDest, addVec3MultDest, subtractVectorsMult, addVectorsMult, addVectorsCopy } from "../../climate/stars/matrix.js";
import { QuadRenderJob } from "../../rendering/model/QuadRenderJob.js";
import { addRenderJob } from "../../rendering/rasterizer.js";
import { STAGE_DEAD } from "../organisms/Stages.js";
import { CoordinateSet } from "../../rendering/model/CoordinateSet.js";
import { sphericalToCartesian } from "../../climate/stars/starHandlerUtil.js";
import { LineRenderJob } from "../../rendering/model/LineRenderJob.js";
import { DEBUG } from "../../index.js";

const NUTRIENT_BASE_HSV = rgb2hsv(RGB_COLOR_GREEN.r, RGB_COLOR_GREEN.g, RGB_COLOR_GREEN.b);
class PlantLifeSquare {
    constructor(organism) {
        this.proto = "PlantLifeSquare";
        this.linkedOrganism = organism;
        this.spawnTime = Date.now();
        // RGB Array
        this.color = [100, 100, 100];
        this.altColor = [0, 0, 0];
        this.colorLightingApplied = [0, 0, 0];
        this.opacity = 1;
        // RGBA String
        this.cachedRgba = null;

        this.frameCacheLighting = getDefaultLighting();
        this.lighting = []

        this.rp = [1, .1, 1, .1, 1]; // xmin, ymin, x2min, y2min, height;
        this.posVec = [0, 0, 0];
        this.posVecDir = [0, 1, 0];

        // Derived rendering member variables.
        this.offset = [0, 0, 0];
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

    purgeUnderscoredValues() {
        let keys = Object.keys(this);
        keys.filter((key) => key.startsWith("_"))
            .forEach((key) => this[key] = null)
    }

    setFrameCartesians() {
        this._cs_root = this._cs_root ?? new CoordinateSet();
        this._cs_tl = this._cs_tl ?? new CoordinateSet();
        this._cs_tr = this._cs_tr ?? new CoordinateSet();
        this._cs_bl = this._cs_bl ?? new CoordinateSet();
        this._cs_br = this._cs_br ?? new CoordinateSet();
        this._sp_cs = this._sp_cs ?? new CoordinateSet();
        this._ep_cs = this._ep_cs ?? new CoordinateSet();

        this._svx = this._svx ?? [0, 0, 0];
        this._svy = this._svy ?? [0, 0, 0];
        this._svx2 = this._svx ?? [0, 0, 0];
        this._svy2 = this._svy ?? [0, 0, 0];

        multiplyVectorByScalarDest(this.posVecDir, this.rp[4], this.offset);
        copyVecValue(this.posVec, this.startPointVec)
        addVec3Dest(this.startPointVec, this.offset, this.endPointVec);

        this._cs_root.setWorld(this.posVec);
        this.forwardVec = normalizeVec3(this._cs_root.offset);
        this.sideVec = normalizeVec3(crossVec3(this.posVecDir, this.forwardVec));

        multiplyVectorByScalarDest(this.sideVec, this.rp[0], this._svx);
        multiplyVectorByScalarDest(this.sideVec, this.rp[1], this._svy);
        multiplyVectorByScalarDest(this.sideVec, this.rp[2], this._svx2);
        multiplyVectorByScalarDest(this.sideVec, this.rp[3], this._svy2);

        this.sideMult = vec3Dot(this.forwardVec, this.offset) / vec3Dot(this.forwardVec, this.forwardVec);

        subtractVectorsDest(this.endPointVec, this.sideVec, this.cartesian_tl);
        addVec3Dest(this.endPointVec, this.sideVec, this.cartesian_tr);
        subtractVectorsDest(this.startPointVec, this.sideVec, this.cartesian_bl);
        addVec3Dest(this.startPointVec, this.sideVec, this.cartesian_br);

        this._sp_cs.setWorld(this.startPointVec);
        this._ep_cs.setWorld(this.endPointVec);

        this._cs_svx = new CoordinateSet(addVectorsCopy(this.startPointVec, this._svx));
        if (this._cs_svx.distToCamera < 8) {
            this._cs_svy = new CoordinateSet(addVectorsCopy(this.startPointVec, this._svy));
            this._cs_svx2 = new CoordinateSet(addVectorsCopy(this.endPointVec, this._svx2));
            this._cs_svy2 = new CoordinateSet(addVectorsCopy(this.endPointVec, this._svy2));
            this.rl(this._sp_cs.renderScreen, this._cs_svx.renderScreen, this._cs_svx.distToCamera, "rgba(121, 63, 142, .125)")
            this.rl(this._sp_cs.renderScreen, this._cs_svy.renderScreen, this._cs_svy.distToCamera, "rgba(63, 142, 121, .125)")
            this.rl(this._sp_cs.renderScreen, this._cs_svx2.renderScreen, this._cs_svx2.distToCamera, "rgba(121, 121, 142, .125)")
            this.rl(this._sp_cs.renderScreen, this._cs_svy2.renderScreen, this._cs_svy2.distToCamera, "rgba(142, 63, 63, .125)")
        }

        this._cs_tl = new CoordinateSet();
        this._cs_tr = new CoordinateSet();
        this._cs_bl = new CoordinateSet();
        this._cs_br = new CoordinateSet();

        this._cs_tl.setWorld(this.cartesian_tl);
        this._cs_tr.setWorld(this.cartesian_tr);
        this._cs_bl.setWorld(this.cartesian_bl);
        this._cs_br.setWorld(this.cartesian_br);


        // addRenderJob(new LineRenderJob(
        //     this._sp_cs.renderScreen,
        //     this._ep_cs.renderScreen,
        //     10 ** 2.8 / (this._sp_cs.distToCamera ** 2),
        //     COLOR_BLUE
        // ), true);
    }
    rl(v1, v2, dtc, color=COLOR_BLUE) {
        addRenderJob(new LineRenderJob(
            v1,
            v2,
            Math.min(10, 10 ** 2.8 / (dtc ** 2)),
            color
        ), true);
    }

    prepareRenderJob() {
        if (this._renderJob == null) {
            this._renderJob = new QuadRenderJob(
                this._cs_tl.renderScreen,
                this._cs_tr.renderScreen,
                this._cs_bl.renderScreen,
                this._cs_br.renderScreen, 
                this.cachedRgba)
        } else {
            this._renderJob.tl = this._cs_tl.renderScreen;
            this._renderJob.tr = this._cs_tr.renderScreen;
            this._renderJob.bl = this._cs_bl.renderScreen;
            this._renderJob.br = this._cs_br.renderScreen;
            this._renderJob.color = this.cachedRgba;
        }
    }

    getSurfaceLightingFactor() {
        return 1;
    }

    getLightFilterRate() {
        return processRangeToOne(loadGD(UI_LIGHTING_PLANT) * this.linkedOrganism.lightDecayValue());
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
        addRenderJob(this._renderJob, true);
    }

    render() {
        if (this.hidden || this.posVecDir == null) {
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
        this.colorLighting = this.processLighting();
        this.colorLightingApplied[0] = (this.color[0] / 255) * this.colorLighting.r;
        this.colorLightingApplied[1] = (this.color[1] / 255) * this.colorLighting.g;
        this.colorLightingApplied[2] = (this.color[2] / 255) * this.colorLighting.b;
        this.cachedRgba = rgbToRgba(...this.colorLightingApplied, .45 * this.opacity);
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