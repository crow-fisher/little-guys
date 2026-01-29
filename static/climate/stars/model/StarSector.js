import { cameraToScreen, cartesianToCamera, cartesianToScreen, screenToRenderScreen } from "../../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../../canvas.js";
import { COLOR_WHITE } from "../../../colors.js";
import { calculateStatistics } from "../../../common.js";
import { addRenderJob, PointLabelRenderJob } from "../../../rasterizer.js";
import { loadGD, UI_SH_STARS_PER_BUCKET } from "../../../ui/UIData.js";

const   Z_VISIBLE = 0b10;
const FOV_VISIBLE = 0b01;

export class StarSector {
    constructor(sector, cartesian, size, stars) {
        this.sector = sector;
        this.cartesian = cartesian;
        this.ready = false;

        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0, 0];

        this.loadedStars = new Array();

        this.buckets = new Array();
        this.bucketLumensCutoffs = new Array();

        this.visibilityFlags = 0;

    }

    render() {
        if (!this.ready) {
            return;
        }

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
        
        this.visibilityFlags = 0;

        cartesianToCamera(this.cartesian, this._camera);
        
        if (this._camera[2] < 0) {
            this.visibilityFlags &= FOV_VISIBLE;
            return;
        }
        cameraToScreen(this._camera, this._screen);
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, this._xOffset, this._yOffset, this._s)

        if (this.sectorRenderJob == null) {
            this.sectorRenderJob = new PointLabelRenderJob(...this._renderScreen, 10, COLOR_WHITE, this.sector);
        } else {
            this.sectorRenderJob.x = this._renderScreen[0];
            this.sectorRenderJob.y = this._renderScreen[1];
            this.sectorRenderJob.z = this._renderScreen[2];
            this.sectorRenderJob.size = 10;
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
        this.lumensSt = calculateStatistics(this.loadedStars.map((star) => star.lumens));
        this.loadedStars.sort((a, b) => a.lumens - b.lumens);
        this.starsPerBucket = loadGD(UI_SH_STARS_PER_BUCKET);
        
        let curBucket = 0;
        this.bucketLumensCutoffs[curBucket] = this.lumensSt[2];
        
        let star;
        for (let i = 0; i < this.loadedStars; i++) {
            star = this.loadedStars.at(i);

            if ((i != 0) && (i % this.starsPerBucket == 0)) {
                curBucket += 1;
                this.bucketLumensCutoffs[curBucket] = star.lumens;
            }
            this.buckets[i] = this.buckets[i] ?? new Array();
            this.buckets[i].push(star);
        }
        this.ready = true;
    }
    
}