import { calculateStatistics, invlerp, lerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { loadGD, UI_SH_MINSIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_SH_STYLE_BRIGHTNESS_B, UI_SH_STYLE_BRIGHTNESS_A, UI_SH_STYLE_SIZE_A, UI_SH_STYLE_SIZE_B, UI_AA_PLOT_SELECTRADIUS, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_TOPBAR_AA, UI_SH_STYLE_SIZE_C, UI_SH_MAXSIZE, UI_SH_STYLE_BRIGHTNESS_C, UI_CAMERA_FOV, UI_AA_SETUP_COLORMODE, UI_CAMERA_OFFSET_VEC } from "../../../ui/UIData.js";
import { hsvToHex } from "../../../color/color.js";
import { renderPointLabel } from "../../../rendering/renderFunctions.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { addVec3Dest } from "../../../util/vector.js";

const Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(starManager, sector, cartesian, cartesianBounds) {
        this.starManager = starManager;
        this.sector = sector;
        this.cartesian = cartesian;
        this.cartesianBounds = cartesianBounds;
        this.cs = new CoordinateSet(this.starManager.getCameraManager(), this.cartesian);

        this.rootCameraDist = this.cs.distToCamera;
        this.curCameraDist = this.rootCameraDist;
        this.prevCameraDist = 0;
        this.recalculateStarColorFlag = true;

        this.cameraDistRefPoint = [0, 0, 0];

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

    render() {
        if (!this.ready) {
            return;
        }

        let ret;
        this.renderPrepare();

        if (this.cs.isVisibleOnScreenRange()) {
            ret = this.renderStars(
                this.getLuminanceParams(),
                this.getSizeParams(),
                this.getBrightnessParams(),
                this.getLocalitySelectParams(),
                this.getRenderMode()
            );

            renderPointLabel(
                this.starManager.worldManager.getContext(),
                this.cs.renderScreen[0],
                this.cs.renderScreen[1],
                this.cs.renderScreen[2],
                800 / this.cs.distToCamera,
                hsvToHex(0, 0, 1),
                ""
            )
        };
        return ret;

    }

    setCurCameraPoint() {
        this.cameraDistRefPoint[0] = Math.min(Math.max(this.cartesianBounds[0], -loadGD(UI_CAMERA_OFFSET_VEC)[0]), this.cartesianBounds[3]);
        this.cameraDistRefPoint[1] = Math.min(Math.max(this.cartesianBounds[1], -loadGD(UI_CAMERA_OFFSET_VEC)[1]), this.cartesianBounds[4]);
        this.cameraDistRefPoint[2] = Math.min(Math.max(this.cartesianBounds[2], -loadGD(UI_CAMERA_OFFSET_VEC)[2]), this.cartesianBounds[5]);
    }

    renderPrepare() {
        // this.setCurCameraPoint();
        // this.cs.setWorld(this.cameraDistRefPoint);

        this.cs.process();

        this.curCameraDist = this.cs.distToCamera;
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
        this.recalculateStarColorFlag = true;

        let ret = 0;
        for (let i = 0, bucketLumens; i < this.buckets.length; i++) {
            bucketLumens = this.bucketLumensCutoffs.at(i) * this.relCameraDistBrightnessMult;
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

                star._relLumens = star.lumens * star._relCameraDistBrightnessMult;

                star._relLumensLog = Math.log(star._relLumens);
                star._relLumensRange = Math.max(0, Math.min(1, invlerp(luminanceParams[0], luminanceParams[1], star._relLumens)));

                star._size = this.processStarSize(star, sizeParams);
                star.renderColor = this.processStarColor(star, brightnessParams, renderMode);
                star.doLocalitySelect(...localitySelectParams)
                star.starLabel = star.localitySelect ? star.id : null;
            }
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