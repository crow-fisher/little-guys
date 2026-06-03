import { calculateStatistics, invlerp, lerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { loadGD, UI_SH_MINSIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_SH_STYLE_BRIGHTNESS_B, UI_SH_STYLE_BRIGHTNESS_A, UI_SH_STYLE_SIZE_A, UI_SH_STYLE_SIZE_B, UI_AA_PLOT_SELECTRADIUS, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_TOPBAR_AA, UI_SH_STYLE_SIZE_C, UI_SH_MAXSIZE, UI_SH_STYLE_BRIGHTNESS_C, UI_CAMERA_FOV, UI_AA_SETUP_COLORMODE, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { hsvToHex } from "../../../color/color.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { addScalarMultToVec3, addVec3Dest, addVec3MultDest, addVec3MultDestAdd, addVectors, copyVecValue, getVec3Length, normalizeVec3 } from "../../../util/vector.js";

const Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(starManager, sector, cartesian, cartesianBounds) {
        this.starManager = starManager;
        this.sector = sector;
        this.cartesian = cartesian;
        this.center = addScalarMultToVec3(cartesian, this.starManager.sectorSize, 0.5)
        this.corner = addScalarMultToVec3(cartesian, this.starManager.sectorSize, 1)
        this.cartesianBounds = cartesianBounds;

        this.rootCs = new CoordinateSet(this.starManager.getCameraManager(), this.cartesian);
        this.centerCs = new CoordinateSet(this.starManager.getCameraManager(), this.center);
        this.cornerCs = new CoordinateSet(this.starManager.getCameraManager(), this.corner);
        this.brightnessCs = new CoordinateSet(this.starManager.getCameraManager(), this.cartesian);

        this.fovCs = new CoordinateSet(this.starManager.getCameraManager(), this.cartesian);

        this.rootCameraDist = this.fovCs.distToCamera;
        this.curCameraDist = this.rootCameraDist;
        this.prevCameraDist = 0;
        this.recalculateStarColorFlag = true;

        this.loadedStars = new Array();
        this.constellationStars = new Set();

        this.visibilityFlags = 0;
    }

    gcvStBrightnessPosX() {
        return this.starManager.getAstronomyAtlasComponent().gcvStBrightnessPosX();
    }
    gcvStBrightnessPosY() {
        return this.starManager.getAstronomyAtlasComponent().gcvStBrightnessPosY();
    }
    gcvStBrightnessC() {
        return this.starManager.getAstronomyAtlasComponent().gcvStBrightnessC();
    }
    gcvStOpacityPosX() {
        return this.starManager.getAstronomyAtlasComponent().gcvStOpacityPosX();
    }
    gcvStOpacityPosY() {
        return this.starManager.getAstronomyAtlasComponent().gcvStOpacityPosY();
    }
    gcvStOpacityC() {
        return this.starManager.getAstronomyAtlasComponent().gcvStOpacityC();
    }
    gcvMinSize() {
        return this.starManager.getAstronomyAtlasComponent().gcvMinSize();
    }
    gcvMaxSize() {
        return this.starManager.getAstronomyAtlasComponent().gcvMaxSize();
    }
    gcvMinLuminance() {
        return this.starManager.getAstronomyAtlasComponent().gcvMinLuminance();
    }
    gcvMaxLuminance() {
        return this.starManager.getAstronomyAtlasComponent().gcvMaxLuminance();
    }
    gcvDistPowerMult() {
        return this.starManager.getAstronomyAtlasComponent().gcvDistPowerMult();
    }

    getSizeParams() {
        return [
            this.gcvStBrightnessPosX(),
            this.gcvStBrightnessPosY(),
            this.gcvStBrightnessC(),
            this.gcvMinSize(),
            this.gcvMaxSize()
        ]
    }

    getBrightnessParams() {
        return [
            this.gcvStOpacityPosX(),
            this.gcvStOpacityPosY(),
            this.gcvStOpacityC()
        ];
    }

    getLuminanceParams() {
        return [
            processRangeToOne(-1 * 10 ** (5 - this.gcvMinLuminance())),
            processRangeToOne(this.gcvMaxLuminance()),
            this.gcvDistPowerMult()
        ];
    }

    getLocalitySelectParams() {
        return [
            loadGD(UI_AA_PLOT_LOCALITY_SELECTMODE),
            loadGD(UI_AA_PLOT_SELECTRADIUS)
        ];
    }

    getRenderMode() {
        return loadGD(UI_AA_SETUP_COLORMODE) != "default";
    }

    setFunc(func) {
        this.func = func;
        return this;
    }

    render() {
        if (!this.ready) {
            return;
        }
        this.renderPrepare();
        if (this.prevStarsRendered > 0 || this.fovCs.isVisibleOnScreen() || this.centerCs.isVisibleOnScreen() || this.rootCs.isVisibleOnScreen() || this.cornerCs.isVisibleOnScreen()) {
            this.prevStarsRendered = this.curStarsRendered;
            this.curStarsRendered = 0;
            this.curStarsRendered = this.renderStars(
                this.getLuminanceParams(),
                this.getSizeParams(),
                this.getBrightnessParams(),
                this.getLocalitySelectParams(),
                this.getRenderMode()
            );

            //         renderPointLabel(
            //         this.starManager.worldManager.getContext(),
            //         this.cornerCs.renderScreen[0],
            //         this.cornerCs.renderScreen[1],
            //         this.cornerCs.renderScreen[2],
            //         8000 / this.cornerCs.distToCamera,
            //         hsvToHex(0, 0, 0.5),
            //         ""
            //     ) 

            //     renderPointLabel(
            //         this.starManager.worldManager.getContext(),
            //         this.brightnessCs.renderScreen[0],
            //         this.brightnessCs.renderScreen[1],
            //         this.brightnessCs.renderScreen[2],
            //         8000 / this.brightnessCs.distToCamera,
            //         hsvToHex(0, 0, 0),
            //         ""
            //     )

            //     renderPointLabel(
            //         this.starManager.worldManager.getContext(),
            //         this.rootCs.renderScreen[0],
            //         this.rootCs.renderScreen[1],
            //         this.rootCs.renderScreen[2],
            //         8000 / this.rootCs.distToCamera,
            //         hsvToHex(0, 0, 1),
            //         ""
            //     )

            //             renderPointLabel(
            //         this.starManager.worldManager.getContext(),
            //         this.centerCs.renderScreen[0],
            //         this.centerCs.renderScreen[1],
            //         this.centerCs.renderScreen[2],
            //         8000 / this.centerCs.distToCamera,
            //         hsvToHex(0, 0, 1),
            //         ""
            //     )

            //         renderPointLabel(
            // this.starManager.worldManager.getContext(),
            //         this.fovCs.renderScreen[0],
            //         this.fovCs.renderScreen[1],
            //         this.fovCs.renderScreen[2],
            //         8000 / this.fovCs.distToCamera,
            //         hsvToHex(this.fovCs.distToCamera + 10 * getVec3Length(this.cartesian), 1, 1),
            //         ""
            //         );

            //         renderLine(
            //             this.starManager.worldManager.getContext(),
            //             this.centerCs.renderScreen,
            //             this.fovCs.renderScreen,
            //             3,
            //             hsvToHex(this.fovCs.distToCamera + 10 * getVec3Length(this.cartesian), 1, 1)
            //         )
        }
        return this.curStarsRendered;
    }

    setBrightnessCameraPoint() {
        copyVecValue(loadGD(UI_CAMERA_OFFSET_VEC), this.brightnessCs.world)
        this.brightnessCs.world[0] = Math.min(Math.max(this.cartesianBounds[0], this.brightnessCs.world[0]), this.cartesianBounds[3]);
        this.brightnessCs.world[1] = Math.min(Math.max(this.cartesianBounds[1], this.brightnessCs.world[1]), this.cartesianBounds[4]);
        this.brightnessCs.world[2] = Math.min(Math.max(this.cartesianBounds[2], this.brightnessCs.world[2]), this.cartesianBounds[5]);
        this.brightnessCs.process();
    }

    setFOVCameraPoint() {
        addVec3MultDest(loadGD(UI_CAMERA_OFFSET_VEC), this.starManager.worldManager.mainManager.cameraManager.forward, -this.fovCs.distToCamera, this.fovCs.world);
        normalizeVec3(this.fovCs.world);
        addVec3MultDest(this.center, this.fovCs.world, this.starManager.sectorSize * Math.SQRT2, this.fovCs.world);
        this.fovCs.process();
    }

    renderPrepare() {
        this.setBrightnessCameraPoint();
        this.setFOVCameraPoint();
        this.rootCs.process();
        this.centerCs.process();
        this.cornerCs.process();

        this.curCameraDist = this.fovCs.distToCamera;
        this.relCameraDist = (this.curCameraDist / this.rootCameraDist);
        this.relCameraDistBrightnessMult = 1 / (this.relCameraDist ** loadGD(UI_SH_DISTPOWERMULT));
        this.recalculateStarColorFlag |= (Math.min(this.curCameraDist, this.prevCameraDist) / Math.max(this.curCameraDist, this.prevCameraDist)) < 0.97;
    }

    processRange(x, a, b, c) {
        return (c) * (x ** a) + (1 - c) * (x ** b);
    }

    processStarSize(star, sizeParams) {
        star._sizeRange = this.processRange(star._relLumensRange, ...sizeParams);
        return lerp(sizeParams[3], sizeParams[3] + sizeParams[4], star._sizeRange);
    }

    processStarColor(star, brightnessParams, renderMode) {
        star._opacity = this.processRange(star._relLumensRange, ...brightnessParams);
        if (star._opacity == 0) {
            return;
        }
        if (!renderMode) {
            return rgbToRgba(...star.color, star._opacity);
        } else {
            return rgbToRgba(...star.alt_color, star._opacity);
        }
    }

    renderStars(luminanceParams, sizeParams, brightnessParams, localitySelectParams, renderMode) {
        this.recalculateStarColorFlag = this.starManager.getAstronomyAtlasComponent().dirtyConfig;

        let ret = 0;
        for (let i = 0, bucketLumens; i < this.buckets.length; i++) {
            bucketLumens = this.bucketLumensCutoffs.at(i) * this.relCameraDistBrightnessMult * this.starManager.fovMult;
            if (bucketLumens >= luminanceParams[0]) {
                ret += this.prepareAndRenderBucket(this.buckets.at(i), luminanceParams, sizeParams, brightnessParams, localitySelectParams, renderMode);
            }
        };
        if (this.recalculateStarColorFlag) {
            this.prevCameraDist = this.curCameraDist;
            this.recalculateStarColorFlag = false;
        }
        return ret;
    }

    prepareAndRenderBucket(bucket, luminanceParams, sizeParams, brightnessParams, localitySelectParams, renderMode) {
        bucket.forEach((star) => star.process());
        let ret = 0;
        bucket.filter((star) => star.cs.isVisibleOnScreen()).forEach((star) => {
            if (this.recalculateStarColorFlag) {
                star._curCameraDistance = star.cs.distToCamera;
                star._relCameraDist = (star._curCameraDistance / star._rootCameraDistance);
                star._relCameraDistBrightnessMult = 1 / (star._relCameraDist ** luminanceParams[2]);

                star._relLumens = star.lumens * star._relCameraDistBrightnessMult * this.starManager.fovMult;

                if (star._relLumens < luminanceParams[0]) {
                    return;
                }

                star._relLumensLog = Math.log(star._relLumens);
                star._relLumensRange = Math.max(0, Math.min(1, invlerp(luminanceParams[0], luminanceParams[1], star._relLumens)));

                star._size = this.processStarSize(star, sizeParams);
                star.renderColor = this.processStarColor(star, brightnessParams, renderMode);
                star.doLocalitySelect(...localitySelectParams)
                star.starLabel = star.localitySelect ? star.id : null;
            }
            ret += 1;
            star.render();
        });

        return ret;
    }

    prepareBucket(bucket) {
        bucket.forEach((star) => star.process());
    }

    renderBucket(bucket, luminenceParams, renderMode) {
        bucket.forEach((star) => {
            if (renderMode && star._rac_val == null) {
                return;
            }
            if (star._renderScreen[2] < 0 && star._relLumensRange > 0) {
                if (star._renderScreen[0] > 0 && star._renderScreen[0] < cw && star._renderScreen[1] > 0 && star._renderScreen[1] < ch) {
                    star.render();
                }
            }
        });
    }



    loadStar(star) {
        this.loadedStars.push(star);
        star.sector = this;
    }

    processLoadedStars() {
        this.lumensSt = calculateStatistics(this.loadedStars.map((star) => star.lumens));
        this.loadedStars.sort((a, b) => a.lumens - b.lumens);

        let lumenBucketSize = .00004;

        this.buckets = new Array();
        this.bucketLumensCutoffs = new Array();

        let curBucket = 0;
        this.bucketLumensCutoffs[0] = this.loadedStars.at(0).lumens;
        let curLumensCutoff = this.bucketLumensCutoffs[curBucket] + lumenBucketSize;
        let star;
        for (let i = 0; i < this.loadedStars.length; i++) {
            star = this.loadedStars.at(i);
            if (star.lumens > curLumensCutoff) {
                this.bucketLumensCutoffs[curBucket] = star.lumens;
                curBucket += 1;
                curLumensCutoff = Math.min(curLumensCutoff + lumenBucketSize, star.lumens);
            }
            this.buckets[curBucket] = this.buckets[curBucket] ?? new Array();
            this.buckets[curBucket].push(star);
            star.bucket = curBucket;
        }
        this.bucketLumensCutoffs[curBucket] = this.loadedStars.reverse().at(0).lumens;
        this.ready = true;
    }

}