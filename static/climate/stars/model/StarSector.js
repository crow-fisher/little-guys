import { cameraToScreen, cartesianToCamera, cartesianToScreen, debugRenderLineCartesianPoints, screenToRenderScreen } from "../../../rendering/camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../../canvas.js";
import { COLOR_BLUE, COLOR_GREEN, COLOR_OTHER_BLUE, COLOR_RED, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics, invlerp, lerp, processRangeToOne, rgbToRgba } from "../../../common.js";
import { addRenderJob } from "../../../rendering/rasterizer.js";
import { loadGD, UI_CAMERA_OFFSET_VEC, UI_SH_MINSIZE, UI_SH_DISTPOWERMULT, UI_SH_MAXLUMINENCE, UI_SH_MINLUMINENCE, UI_SH_STYLE_BRIGHTNESS_B, UI_SH_STYLE_BRIGHTNESS_A, UI_SH_STYLE_SIZE_A, UI_SH_STYLE_SIZE_B, UI_AA_PLOT_SELECTRADIUS, UI_AA_PLOT_LOCALITY_SELECTMODE, UI_AA_PLOT_ACTIVE, UI_SH_STYLE_SIZE_C, UI_SH_MAXSIZE, UI_SH_STYLE_BRIGHTNESS_C } from "../../../ui/UIData.js";
import { getAstronomyAtlasComponent } from "../../../ui/WindowManager.js";
import { addVec3Dest, getVec3Length } from "../matrix.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../../rendering/model/PointLabelRenderJob.js";

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
        return [
            loadGD(UI_SH_STYLE_SIZE_A),
            loadGD(UI_SH_STYLE_SIZE_B),
            loadGD(UI_SH_STYLE_SIZE_C),
            loadGD(UI_SH_MINSIZE),
            loadGD(UI_SH_MAXSIZE),
        ];
    }

    getBrightnessParams() {
        return [
            loadGD(UI_SH_STYLE_BRIGHTNESS_A),
            loadGD(UI_SH_STYLE_BRIGHTNESS_B),
            loadGD(UI_SH_STYLE_BRIGHTNESS_C)
        ];
    }

    getLuminenceParams() {
        return [
            processRangeToOne(-1 * 10 ** (5 - loadGD(UI_SH_MINLUMINENCE))),
            processRangeToOne(loadGD(UI_SH_MAXLUMINENCE)),
            loadGD(UI_SH_DISTPOWERMULT)
        ];
    }

    getLocalitySelectParams() {
        return [
            loadGD(UI_AA_PLOT_LOCALITY_SELECTMODE),
            loadGD(UI_AA_PLOT_SELECTRADIUS)
        ];
    }

    renderMain() {
        if (!this.ready) {
            return;
        }
        this.renderPrepare();

        if (this._curCameraDist < Math.exp(7)) {
            this.visibilityFlags = 0;
        }

        let debug = new URLSearchParams(document.location.search).get("debug");
        if (debug && this._curCameraDist < Math.exp(loadGD(UI_AA_PLOT_SELECTRADIUS))) {
            // this.renderSector();
        }

        if (this.visibilityFlags == 0) {
            this.renderStars(
                this.getLuminenceParams(),
                this.getSizeParams(),
                this.getBrightnessParams(),
                this.getLocalitySelectParams()
            );

        }
    }

    setCurCameraPoint() {
        this._cameraDistRefPoint[0] = Math.min(Math.max(this.cartesianBounds[0], -this._curCameraPosition[0]), this.cartesianBounds[3]);
        this._cameraDistRefPoint[1] = Math.min(Math.max(this.cartesianBounds[1], -this._curCameraPosition[1]), this.cartesianBounds[4]);
        this._cameraDistRefPoint[2] = Math.min(Math.max(this.cartesianBounds[2], -this._curCameraPosition[2]), this.cartesianBounds[5]);
    }

    renderPrepare() {
        if (loadGD(UI_AA_PLOT_ACTIVE)) {
            this.loadedStars.forEach((star) => {
                star._renderedThisFrame = false;
                star._preparedThisFrame = false;
            });
        }

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

        this._rootCameraDist = getVec3Length(this._cameraDistRefPoint);
        this._curCameraDist = getVec3Length(this._cameraOffset);
        this._relCameraDist = (this._curCameraDist / this._rootCameraDist);
        this._relCameraDistBrightnessMult = 1 / (this._relCameraDist ** loadGD(UI_SH_DISTPOWERMULT));
        this._recalculateStarColorFlag |= (Math.min(this._curCameraDist, this._prevCameraDist) / Math.max(this._curCameraDist, this._prevCameraDist)) < 0.97;

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

    processRange(x, a, b, c) {
        return (c) * (x ** a) + (1 - c) * (x ** b);
    }

    processStarSize(star, sizeParams) {
        star._sizeRange = this.processRange(star._relLumensRange, ...sizeParams);
        return lerp(sizeParams[3], sizeParams[3] + sizeParams[4], star._sizeRange);
    }

    processStarColor(star, brightnessParams) {
        star._opacity = this.processRange(star._relLumensRange, ...brightnessParams);
        return rgbToRgba(...star.color, star._opacity);
    }

    renderStars(luminenceParams, sizeParams, brightnessParams, localitySelectParams) {
        let bucketLumens;

        let recalculatingColor = (this._recalculateStarColorFlag);
        if (recalculatingColor) {
            this._recalculateStarColorFlag = false;
            getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
        }

        for (let i = 0; i < this.buckets.length; i++) {
            bucketLumens = this.bucketLumensCutoffs.at(i) * this._relCameraDistBrightnessMult;
            if (bucketLumens >= luminenceParams[0]) {
                this.prepareBucket(this.buckets.at(i));

                if (recalculatingColor) {
                    this.processBucketSizeColor(this.buckets.at(i), luminenceParams, sizeParams, brightnessParams, localitySelectParams);
                    this._prevCameraDist = this._curCameraDist;
                }
                
                this.renderBucket(this.buckets.at(i), luminenceParams);
            } else {
            }
        };

        if (recalculatingColor) {
            getAstronomyAtlasComponent().plotStarScatter.flagRepreparePoints();
        }
    }

    prepareBucket(bucket) {
        bucket.forEach((star) => {
            addVec3Dest(star.cartesian, this._curCameraPosition, star._offset);
            cartesianToCamera(star._offset, star._camera);
            cameraToScreen(star._camera, star._screen);
            screenToRenderScreen(star._screen, star._renderNorm, star._renderScreen, this._xOffset, this._yOffset, this._s);
            star._preparedThisFrame = true;
        });
    }

    processBucketSizeColor(bucket, luminenceParams, sizeParams, brightnessParams, localitySelectParams) {
        bucket.forEach((star) => {
            star._curCameraDistance = getVec3Length(star._offset);
            star._relCameraDist = (star._curCameraDistance / star._rootCameraDistance);
            star._relCameraDistBrightnessMult = 1 / (star._relCameraDist ** luminenceParams[2]);

            star._relLumens = star.lumens * star._relCameraDistBrightnessMult;

            star._relLumensLog = Math.log(star._relLumens);
            star._relLumensRange = Math.min(1, invlerp(luminenceParams[0], luminenceParams[1], star._relLumens));

            star._size = this.processStarSize(star, sizeParams);
            star.renderColor = this.processStarColor(star, brightnessParams);
            star.doLocalitySelect(...localitySelectParams)
            star.starLabel = star.localitySelect ? star.id : null;
        });
    }

    renderBucket(bucket, luminenceParams) {
        let ch = getCanvasHeight(), cw = getCanvasWidth();
        bucket.forEach((star) => {
            if (star._renderScreen[2] < 0 && star._relLumensRange > 0) {
                if (star._renderScreen[0] > 0 && star._renderScreen[0] < cw && star._renderScreen[1] > 0 && star._renderScreen[1] < ch) {
                    star.render();
                }
            }
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
            [
                [this._x1, this._y1, this._z1],
                [this._x1, this._y1, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x2, this._y1, this._z1],
                [this._x2, this._y1, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x1, this._y2, this._z1],
                [this._x1, this._y2, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x2, this._y2, this._z1],
                [this._x2, this._y2, this._z2],
                COLOR_OTHER_BLUE
            ],
            [
                [this._x1, this._y1, this._z1],
                [this._x2, this._y2, this._z2],
                COLOR_GREEN
            ],
            [
                [this._x1, this._y1, this._z1],
                [(this._x2 + this._x1) / 2, (this._y1 + this._y2) / 2, (this._z1 + this._z2) / 2],
                COLOR_WHITE
            ],
        ];

        lines.forEach((line) => {
            let start = line[0];
            let end = line[1];
            let color = line[2];
            debugRenderLineCartesianPoints(start, end, color);
        })

        debugRenderLineCartesianPoints(
            this._cameraDistRefPoint,
            this.cartesian,
            COLOR_VERY_FUCKING_RED
        )
        // debugRenderLineCartesianPoints(
        //     [this.cartesianBounds[0], this.cartesianBounds[4], this.cartesianBounds[2]],
        //     [this.cartesianBounds[3], this.cartesianBounds[4], this.cartesianBounds[2]]
        // )
        // debugRenderLineCartesianPoints(
        //     [this.cartesianBounds[0], this.cartesianBounds[1], this.cartesianBounds[2]],
        //     [this.cartesianBounds[0], this.cartesianBounds[4], this.cartesianBounds[5]]
        // )
        // debugRenderLineCartesianPoints(
        //     [this.cartesianBounds[3], this.cartesianBounds[1], this.cartesianBounds[2]],
        //     [this.cartesianBounds[3], this.cartesianBounds[4], this.cartesianBounds[5]]
        // )

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
        this.sectorRenderJob.size = 10;
        this.sectorRenderJob.color = COLOR_VERY_FUCKING_RED;
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