import { cameraToScreen, cartesianToCamera, cartesianToScreen, screenToRenderScreen } from "../../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../../canvas.js";
import { COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics } from "../../../common.js";
import { addRenderJob, PointLabelRenderJob } from "../../../rasterizer.js";
import { loadGD, UI_CAMERA_OFFSET_VEC, UI_SH_STARS_PER_BUCKET } from "../../../ui/UIData.js";
import { addVec3Dest, addVectors, calculateDistance, getVec3Length } from "../matrix.js";

const Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(sector, cartesian, size, stars) {
        this.sector = sector;
        this.cartesian = cartesian;
        this.ready = false;

        this._rootCameraDistance = getVec3Length(cartesian);

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


    renderMain() {
        if (!this.ready) {
            return;
        }
        this.renderPrepare();

        if (this.visibilityFlags == 0) {
            this.prepareStars();
            this.renderStars();
            this.renderSector();
        }
    }


    renderPrepare() {
        this._curCameraPosition = loadGD(UI_CAMERA_OFFSET_VEC);
        this._curCameraDistance = calculateDistance(this._curCameraPosition, this.cartesian);
        this._relCameraDist = (this._curCameraDistance / this._rootCameraDistance);
        this._relCameraDistBrightnessMult = 1 / (this._relCameraDist ** 2);

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
        this.visibilityFlags = 0;
        addVec3Dest(this.cartesian, this._curCameraPosition, this._cameraOffset);
        cartesianToCamera(this._cameraOffset, this._camera);

        if (this._camera[2] < 0) {
            this.visibilityFlags &= FOV_VISIBLE;
            return;
        }
        cameraToScreen(this._camera, this._screen);
    }

    renderStars() {
        for (let i = 0; i < this.buckets.length; i++) {
            this.buckets.at(i).forEach((star) => {
                star.renderColor = COLOR_VERY_FUCKING_RED;
                star._size = 1;
                star.render();
            });
        }
    }

    prepareStars() {
        for (let i = 0; i < this.buckets.length; i++) {
            this.buckets.at(i).forEach((star) => {
                addVec3Dest(star.cartesian, this._curCameraPosition, star._offset);
                cartesianToCamera(star._offset, star._camera);
                cameraToScreen(star._camera, star._screen);
                screenToRenderScreen(star._screen, star._renderNorm, star._renderScreen, this._xOffset, this._yOffset, this._s)
            })
        }
    }


    renderSector() {
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, this._xOffset, this._yOffset, this._s)
        if (this.sectorRenderJob == null) {
            this.sectorRenderJob = new PointLabelRenderJob(...this._renderScreen, 10, COLOR_WHITE, this.cartesian);
        } else {
            this.sectorRenderJob.x = this._renderScreen[0];
            this.sectorRenderJob.y = this._renderScreen[1];
            this.sectorRenderJob.z = this._renderScreen[2];
            this.sectorRenderJob.size = 3;
            this.sectorRenderJob.color = COLOR_WHITE;
            this.sectorRenderJob.label = this.sector;
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
        console.log("Sector processing stars: ", this.loadedStars.length, this.sector, this.cartesian)
        this.lumensSt = calculateStatistics(this.loadedStars.map((star) => star.lumens));
        this.loadedStars.sort((a, b) => a.lumens - b.lumens);
        this.starsPerBucket = loadGD(UI_SH_STARS_PER_BUCKET);

        let curBucket = 0;
        this.bucketLumensCutoffs[curBucket] = this.lumensSt[2];

        let star;
        for (let i = 0; i < this.loadedStars.length; i++) {
            star = this.loadedStars.at(i);
            if ((i != 0) && (i % this.starsPerBucket == 0)) {
                curBucket += 1;
                this.bucketLumensCutoffs[curBucket] = star.lumens;
            }
            this.buckets[i] = this.buckets[i] ?? new Array();
            this.buckets[i].push(star);
        }
        this.ready = true;
        console.log(curBucket);
    }

}