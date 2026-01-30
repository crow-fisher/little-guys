import { cameraToScreen, cartesianToCamera, cartesianToScreen, screenToRenderScreen } from "../../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../../canvas.js";
import { COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, invlerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { addRenderJob, PointLabelRenderJob } from "../../../rasterizer.js";
import { loadGD, UI_CAMERA_OFFSET_VEC, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_SH_STARS_PER_BUCKET, UI_SH_STYLE_BRIGHTNESS_FACTOR, UI_SH_STYLE_BRIGHTNESS_SHIFT, UI_SH_STYLE_SIZE_FACTOR, UI_SH_STYLE_SIZE_SHIFT } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors, addVectorsCopy, calculateDistance, getVec3Length, multiplyVectorByScalar } from "../matrix.js";

const Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(sector, cartesian, size, stars) {
        this.sector = sector;
        this.cartesian = addVectorsCopy(cartesian, multiplyVectorByScalar(size, 0.5));
        this.ready = false;

        this._rootCameraDist = getVec3Length(cartesian);
        this._curCameraDist = this._rootCameraDist;
        this._prevCameraDist = 0;
        this._recalculateStarColorFlag = false;

        this._curCameraPosition = [0, 0, 0];
        this._cameraOffset = [0, 0, 0];
        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0, 0];

        this.loadedStars = new Array();

        this.buckets = new Array();
        this.bucketLumensCutoffs = new Array();

        this.visibilityFlags = 0;
    }

    getSizeParams() {
        return [loadGD(UI_SH_STYLE_SIZE_SHIFT), loadGD(UI_SH_STYLE_SIZE_FACTOR)];
    }

    getBrightnessParams() {
        return [Math.exp(loadGD(UI_SH_STYLE_BRIGHTNESS_FACTOR)), Math.exp(loadGD(UI_SH_STYLE_BRIGHTNESS_SHIFT))];
    }

    getLuminenceParams() {
        return [loadGD(UI_SH_MINLUMINENCE) ** 2, processRangeToOne(loadGD(UI_SH_MAXLUMINENCE)) / 20];
    }

    renderMain() {
        if (!this.ready) {
            return;
        }
        this.renderPrepare();

        if (this.visibilityFlags == 0) {
            this.renderStars(
                this.getLuminenceParams(),
                this.getSizeParams(),
                this.getBrightnessParams());

        }

    }


    renderPrepare() {
        this._curCameraPosition = loadGD(UI_CAMERA_OFFSET_VEC);
        this._curCameraDist = calculateDistance(this._curCameraPosition, this.cartesian);
        this._relCameraDist = (this._curCameraDist / this._rootCameraDist);
        this._relCameraDistBrightnessMult = 1 / (this._relCameraDist ** 2);

        this._recalculateStarColorFlag = (Math.min(this._relCameraDist, this._prevCameraDist) / Math.max(this._relCameraDist, this._prevCameraDist)) < 0.9;

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
        addVec3Dest(this.cartesian, this._curCameraPosition, this._cameraOffset);
        cartesianToCamera(this._cameraOffset, this._camera);
        cameraToScreen(this._camera, this._screen);
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, this._xOffset, this._yOffset, this._s);

        this.visibilityFlags = 0;
        if (this._renderScreen[0] < 0 || this._renderScreen[0] > getCanvasWidth()) {
            this.visibilityFlags |= FOV_VISIBLE;
        }
        if (this._renderScreen[1] < 0 || this._renderScreen[1] > getCanvasHeight()) {
            this.visibilityFlags |= FOV_VISIBLE;
        }
        if (this._renderScreen[2] > 0) {
            this.visibilityFlags |= Z_VISIBLE;
        }
    }

    processStarSize(star, sizeParams) {
        return sizeParams[0] * ((star.lumens * star._relCameraDistBrightnessMult) ** sizeParams[1]);
    }

    processStarColor(star, brightnessParams, luminenceParams) {
        let starBrightness = Math.min(1, invlerp(...luminenceParams, star.lumens * star._relCameraDistBrightnessMult));
        let valInvlerp = (starBrightness ** brightnessParams[1])
        return rgbToRgba(...star.color, valInvlerp);
    }

    renderStars(luminenceParams, sizeParams, brightnessParams) {
        let bucketLumens;

        let recalculatingColor = (this._recalculateStarColorFlag);
        if (recalculatingColor) {
            this._recalculateStarColorFlag = false;
        }

        for (let i = 0; i < this.buckets.length; i++) {
            bucketLumens = this.bucketLumensCutoffs.at(i) * this._relCameraDistBrightnessMult;
            if (true || bucketLumens >= luminenceParams[0]) {
                this.prepareBucket(this.buckets.at(i));
                this.renderBucket(this.buckets.at(i));
                if (recalculatingColor) {
                    this.processBucketSizeColor(this.buckets.at(i), luminenceParams, sizeParams, brightnessParams);
                    this._prevCameraDist = this._curCameraDist;
                }
            }
        }
    }

    prepareBucket(bucket) {
        bucket.forEach((star) => {
            addVec3Dest(star.cartesian, this._curCameraPosition, star._offset);
            cartesianToCamera(star._offset, star._camera);
            cameraToScreen(star._camera, star._screen);
            screenToRenderScreen(star._screen, star._renderNorm, star._renderScreen, this._xOffset, this._yOffset, this._s);
        });
    }

    processBucketSizeColor(bucket, luminenceParams, sizeParams, brightnessParams) {
        bucket.forEach((star) => {
            star._curCameraDistance = getVec3Length(star._offset);
            star._relCameraDist = (star._curCameraDistance / star._rootCameraDistance);
            star._relCameraDistBrightnessMult = 1 / (star._relCameraDist ** 2);
            star._size = this.processStarSize(star, sizeParams);
            star.renderColor = this.processStarColor(star, brightnessParams, luminenceParams);

        });
    }

    renderBucket(bucket) {
        bucket.forEach((star) => {
                star.render();
            });
    }


    renderSector() {
        if (this.sectorRenderJob == null) {
            this.sectorRenderJob = new PointLabelRenderJob(...this._renderScreen, 10, COLOR_WHITE, this.cartesian);
        } else {
            this.sectorRenderJob.x = this._renderScreen[0];
            this.sectorRenderJob.y = this._renderScreen[1];
            this.sectorRenderJob.z = this._renderScreen[2];
            this.sectorRenderJob.size = 3;
            this.sectorRenderJob.color = COLOR_WHITE;
            this.sectorRenderJob.label = this._relCameraDistBrightnessMult.toFixed(2);
        }
        addRenderJob(this.sectorRenderJob);

    }

    renderSectorPoints() {
        this.screen = cartesianToScreen()
    }

    loadStar(star) {
        this.loadedStars.push(star);
    }

    procesLoadedStars() {
        this.lumensSt = calculateStatistics(this.loadedStars.map((star) => star.lumens));
        this.loadedStars.sort((a, b) => a.lumens - b.lumens);
        this.starsPerBucket = 100;

        let curBucket = 0;
        this.bucketLumensCutoffs[curBucket] = this.lumensSt[2];

        let star;
        for (let i = 0; i < this.loadedStars.length; i++) {
            star = this.loadedStars.at(i);
            if ((i != 0) && (i % this.starsPerBucket == 0)) {
                curBucket += 1;
                this.bucketLumensCutoffs[curBucket] = star.lumens;
            }
            this.buckets[curBucket] = this.buckets[curBucket] ?? new Array();
            this.buckets[curBucket].push(star);
        }
        this.ready = true;
    }

}