import { cameraToScreen, cartesianToCamera, cartesianToScreen, renderVec, screenToRenderScreen } from "../../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../../canvas.js";
import { COLOR_BLUE, COLOR_RED, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, invlerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { addRenderJob, LineRenderJob, PointLabelRenderJob } from "../../../rasterizer.js";
import { loadGD, UI_CAMERA_OFFSET_VEC, UI_SH_BASESIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_SH_STARS_PER_BUCKET, UI_SH_STYLE_BRIGHTNESS_FACTOR, UI_SH_STYLE_BRIGHTNESS_SHIFT, UI_SH_STYLE_SIZE_FACTOR, UI_SH_STYLE_SIZE_SHIFT } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors, addVectorsCopy, calculateDistance, getVec3Length, multiplyVectorByScalar } from "../matrix.js";
import { arrayOfNumbersToText, arrayOfVectorsToText } from "../starHandlerUtil.js";

const Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(sector, cartesian, cartesianBounds) {
        this.sector = sector;
        this.cartesian = cartesian;
        this.cartesianBounds = cartesianBounds;
        this.ready = false;

        this._rootCameraDist = getVec3Length(cartesian);
        this._curCameraDist = this._rootCameraDist;
        this._prevCameraDist = 0;
        this._recalculateStarColorFlag = true;

        this._cameraDistRefPoint = [0, 0, 0];

        this._curCameraPosition = [0, 0, 0];
        this._cameraOffset = [0, 0, 0];
        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0, 0];

        this.loadedStars = new Array();

        this.visibilityFlags = 0;
    }

    getSizeParams() {
        return [Math.exp(loadGD(UI_SH_STYLE_SIZE_SHIFT)), processRangeToOne(loadGD(UI_SH_STYLE_SIZE_FACTOR)), processRangeToOne(loadGD(UI_SH_BASESIZE))];
    }

    getBrightnessParams() {
        return [Math.exp(loadGD(UI_SH_STYLE_BRIGHTNESS_FACTOR)), processRangeToOne(loadGD(UI_SH_STYLE_BRIGHTNESS_SHIFT))];
    }

    getLuminenceParams() {
        return [processRangeToOne(loadGD(UI_SH_MINLUMINENCE)), processRangeToOne(loadGD(UI_SH_MAXLUMINENCE)) / 20, loadGD(UI_SH_DISTPOWERMULT)];
    }

    renderMain() {
        if (!this.ready) {
            return;
        }
        this.renderPrepare();

        if (this._curCameraDist < 1000) {
            this.visibilityFlags = 0;
        }

        // this.renderSector();

        if (this.visibilityFlags == 0) {
            this.renderStars(
                this.getLuminenceParams(),
                this.getSizeParams(),
                this.getBrightnessParams());

        }
    }

    setCurCameraPoint() {
        this._cameraDistRefPoint[0] = Math.min(this.cartesianBounds[3], this._curCameraPosition[0]); //Math.min(Math.max(this.cartesianBounds[0], this._curCameraPosition[0]), this.cartesianBounds[3]);
        this._cameraDistRefPoint[1] = Math.min(this.cartesianBounds[4], this._curCameraPosition[1]); //Math.min(Math.max(this.cartesianBounds[1], this._curCameraPosition[1]), this.cartesianBounds[4]);
        this._cameraDistRefPoint[2] = Math.min(this.cartesianBounds[5], this._curCameraPosition[2]); //Math.min(Math.max(this.cartesianBounds[2], this._curCameraPosition[2]), this.cartesianBounds[5]);
    }

    renderPrepare() {
        this._curCameraPosition = loadGD(UI_CAMERA_OFFSET_VEC);

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);

        this.setCurCameraPoint();

        addVec3Dest(this.cartesian, this._curCameraPosition, this._cameraOffset);
        cartesianToCamera(this._cameraOffset, this._camera);
        cameraToScreen(this._camera, this._screen);
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, this._xOffset, this._yOffset, this._s);

        this._curCameraDist = getVec3Length(this._cameraOffset);
        this._relCameraDist = (this._curCameraDist / this._rootCameraDist);
        this._relCameraDistBrightnessMult = 1 / (this._relCameraDist ** loadGD(UI_SH_DISTPOWERMULT));
        this._recalculateStarColorFlag |= (Math.min(this._curCameraDist, this._prevCameraDist) / Math.max(this._curCameraDist, this._prevCameraDist)) < 0.95;

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

    processStarSize(star, sizeParams, lp) {
        return sizeParams[2] + 100 * sizeParams[0] * Math.min((star.lumens * star._relCameraDistBrightnessMult) - lp[0], lp[1]);
    }

    processStarColor(star, brightnessParams, luminenceParams) {
        let opacity = ((brightnessParams[0] * ((star.lumens * star._relCameraDistBrightnessMult) - luminenceParams[0])) ** brightnessParams[1])
        return rgbToRgba(...star.color, opacity);
    }

    renderStars(luminenceParams, sizeParams, brightnessParams) {
        let bucketLumens;

        let recalculatingColor = (this._recalculateStarColorFlag);
        if (recalculatingColor) {
            this._recalculateStarColorFlag = false;
        }

        for (let i = 0; i < this.buckets.length; i++) {
            bucketLumens = this.bucketLumensCutoffs.at(i) * this._relCameraDistBrightnessMult;
            if (bucketLumens >= luminenceParams[0]) {
                this.prepareBucket(this.buckets.at(i));

                if (recalculatingColor) {
                    this.processBucketSizeColor(this.buckets.at(i), luminenceParams, sizeParams, brightnessParams);
                    this._prevCameraDist = this._curCameraDist;
                }

                this.renderBucket(this.buckets.at(i), luminenceParams);
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
            star._relCameraDistBrightnessMult = 1 / (star._relCameraDist ** luminenceParams[2]);

            star._size = this.processStarSize(star, sizeParams, luminenceParams);
            star.renderColor = this.processStarColor(star, brightnessParams, luminenceParams);
            // star.starLabel = star.lumens * star._relCameraDistBrightnessMult; 
        });
    }

    renderBucket(bucket, luminenceParams) {
        bucket.forEach((star) => {
            if (star._renderScreen[2] < 0 && (star.lumens * star._relCameraDistBrightnessMult > luminenceParams[0]))
                star.render();
        });
    }

    debugRenderBounds() {
        this._x1 = this.cartesianBounds[0];
        this._x2 = this.cartesianBounds[3];
        this._y1 = this.cartesianBounds[1];
        this._y2 = this.cartesianBounds[4];
        this._z1 = this.cartesianBounds[2];
        this._z2 = this.cartesianBounds[5];


        let lines = [
            [
                [this._x1, this._y1, this._z1],
                [this._x2, this._y1, this._z1],
                COLOR_BLUE
            ],
            [
                [this._x2, this._y1, this._z1],
                [this._x2, this._y2, this._z1],
                COLOR_RED
            ],
            [
                [this._x2, this._y2, this._z1],
                [this._x1, this._y2, this._z1],
                COLOR_BLUE
            ],
            [
                [this._x1, this._y2, this._z1],
                [this._x1, this._y1, this._z1],
                COLOR_RED
            ],
            [
                [this._x1, this._y1, this._z2],
                [this._x2, this._y1, this._z2],
                COLOR_BLUE
            ],
            [
                [this._x2, this._y1, this._z2],
                [this._x2, this._y2, this._z2],
                COLOR_RED
            ],
            [
                [this._x2, this._y2, this._z2],
                [this._x1, this._y2, this._z2],
                COLOR_BLUE
            ],
            [
                [this._x1, this._y2, this._z2],
                [this._x1, this._y1, this._z2],
                COLOR_RED
            ],
        ];

        lines.forEach((line) => {
            let start = line[0];
            let end = line[1];
            let color = line[2];
            this.debugRenderLineCartesianPoints(start, end, color);
            this.debugRenderLineCartesianPoints(start, this.cartesian, color);
        })

        this.debugRenderLineCartesianPoints(
            [this.cartesianBounds[0], this.cartesianBounds[1], this.cartesianBounds[2]],
            [this.cartesianBounds[3], this.cartesianBounds[1], this.cartesianBounds[2]]
        )
        this.debugRenderLineCartesianPoints(
            [this.cartesianBounds[0], this.cartesianBounds[4], this.cartesianBounds[2]],
            [this.cartesianBounds[3], this.cartesianBounds[4], this.cartesianBounds[2]]
        )
        this.debugRenderLineCartesianPoints(
            [this.cartesianBounds[0], this.cartesianBounds[1], this.cartesianBounds[2]],
            [this.cartesianBounds[0], this.cartesianBounds[4], this.cartesianBounds[5]]
        )
        this.debugRenderLineCartesianPoints(
            [this.cartesianBounds[3], this.cartesianBounds[1], this.cartesianBounds[2]],
            [this.cartesianBounds[3], this.cartesianBounds[4], this.cartesianBounds[5]]
        )

    }

    debugRenderLineCartesianPoints(cartesian1, cartesian2, color) {
        let offset1 = [0, 0, 0];
        let offset2 = [0, 0, 0];
        let camera1 = [0, 0, 0];
        let camera2 = [0, 0, 0];
        let screen1 = [0, 0, 0];
        let screen2 = [0, 0, 0];
        let renderNorm1 = [0, 0];
        let renderNorm2 = [0, 0];
        let renderScreen1 = [0, 0, 0];
        let renderScreen2 = [0, 0, 0];

        addVec3Dest(cartesian1, this._curCameraPosition, offset1);
        addVec3Dest(cartesian2, this._curCameraPosition, offset2);
        cartesianToCamera(offset1, camera1);
        cartesianToCamera(offset2, camera2);
        cameraToScreen(camera1, screen1);
        cameraToScreen(camera2, screen2);
        screenToRenderScreen(screen1, renderNorm1, renderScreen1, this._xOffset, this._yOffset, this._s);
        screenToRenderScreen(screen2, renderNorm2, renderScreen2, this._xOffset, this._yOffset, this._s);


        if (renderScreen1[2] < 0 && renderScreen2[2] < 0) {
            addRenderJob(new LineRenderJob(renderScreen1, renderScreen2, 3, color, renderScreen2.z));
        }

    }



    renderSector() {
        if (this._renderScreen[2] > 0) {
            return;
        }
        if (this.sectorRenderJob == null) {
            this.sectorRenderJob = new PointLabelRenderJob();
        }
        this.sectorRenderJob.x = this._renderScreen[0];
        this.sectorRenderJob.y = this._renderScreen[1];
        this.sectorRenderJob.z = this._renderScreen[2];
        this.sectorRenderJob.size = 3;
        this.sectorRenderJob.color = COLOR_WHITE;
        // this.sectorRenderJob.label = this.visibilityFlags + " | " + arrayOfVectorsToText([this.sector, this._cameraDistRefPoint]);
        // this.sectorRenderJob.label = arrayOfNumbersToText([this._rootCameraDist, this._curCameraDist, this._relCameraDistBrightnessMult]);

        addRenderJob(this.sectorRenderJob);

        this.debugRenderBounds();

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

        this.buckets = new Array();
        this.bucketLumensCutoffs = new Array();

        this.bucketLumensCutoffs[curBucket] = this.lumensSt[2];

        let lumenBucketSize = .001;
        let curLumensCutoff = this.lumensSt[2] + lumenBucketSize;

        let star;
        for (let i = 0; i < this.loadedStars.length; i++) {
            star = this.loadedStars.at(i);
            if (star.lumens > curLumensCutoff) {
                curBucket += 1;
                this.bucketLumensCutoffs[curBucket] = curLumensCutoff;
                curLumensCutoff += lumenBucketSize;
            }

            this.buckets[curBucket] = this.buckets[curBucket] ?? new Array();
            this.buckets[curBucket].push(star);
        }
        this.ready = true;
    }

}