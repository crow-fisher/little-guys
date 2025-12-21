import { cartesianToScreenInplace, frameMatrixReset, getForwardVec } from "../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../canvas.js";
import { rgbToRgba } from "../../common.js";
import { addRenderJob, LineRenderJob, PointRenderJob } from "../../rasterizer.js";
import {
    loadGD, UI_STARMAP_ZOOM,
    UI_STARMAP_NORMAL_BRIGTNESS,
    UI_STARMAP_CONSTELATION_BRIGHTNESS,
    UI_STARMAP_STAR_MIN_SIZE,
    UI_STARMAP_STAR_MAX_SIZE,
    UI_STARMAP_STAR_SIZE_FACTOR,
    UI_STARMAP_STAR_OPACITY_FACTOR,
    UI_STARMAP_STAR_OPACITY_SHIFT,
    UI_STARMAP_BRIGHTNESS_SHIFT,
    UI_STARMAP_SHOW_CONSTELLATION_NAMES,
    UI_CAMERA_OFFSET_VEC
} from "../../ui/UIData.js";
import { tempToColorForStar } from "../time.js";
import { dotVec3Copy, normalizeVec3, subtractVectorsCopy } from "./matrix.js";

// https://resources.wolframcloud.com/FormulaRepository/resources/Luminosity-Formula-for-Absolute-Magnitude
// maximum value  85.5066712885
function brightnessValueToLumensNormalized(brightnessRaw) {
    brightnessRaw = Math.max(1, brightnessRaw);
    return (10 ** (0.4 * (4.83 - brightnessRaw))) / 85.5066712885;
}
function sphericalToCartesianInplace(target, cameraOffset, yaw, pitch, m) {
    target[0] = m * Math.cos(yaw) * Math.cos(pitch) + cameraOffset[0]
    target[1] = m * Math.sin(pitch) + cameraOffset[1]
    target[2] = m * Math.sin(yaw) * Math.cos(pitch) + cameraOffset[2]
}

class Constellation {
    constructor(data) {
        let row = data.split(" ");
        this.name = row[0];
        this.numbers = Array.from(row.slice(1).map((x) => parseInt(x)));
        this.length = this.numbers[0];
        this.segments = new Array(this.length);

        this.uniqueStars = new Set(this.numbers.slice(1));

        for (let i = 0; i < this.length; i++) {
            let startIdx = 1 + (i * 2);
            let endIdx = startIdx + 1;
            this.segments[i] = [parseInt(this.numbers[startIdx]), parseInt(this.numbers[endIdx])];
        }
    }
}

class Star {
    // ascension and declination in radians
    constructor(id, asc, dec, magnitude, color, parallax) {
        this.id = id;
        this.asc = asc;
        this.dec = dec;
        this.magnitude = magnitude;
        this.color = color;
        this.parallax = parallax;
        this._cartesian = [0, 0, 0];
        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0];
        this._size = 0;
        this._opacity = 0;
        this._brightness = 0;

        this.recalculateScreenFlag = true;
    }

    recalculateScreen(frameCache) {
        this._brightness = brightnessValueToLumensNormalized(this.magnitude + frameCache.UI_STARMAP_BRIGHTNESS_SHIFT);
        sphericalToCartesianInplace(this._cartesian, frameCache.UI_CAMERA_OFFSET_VEC, this.asc, -this.dec, (1 / this.parallax) * 10 ** (frameCache.UI_STARMAP_ZOOM));

        this._size = (this._brightness ** frameCache.UI_STARMAP_STAR_SIZE_FACTOR) * frameCache.UI_STARMAP_STAR_MAX_SIZE;
        this._opacity = (this._brightness ** frameCache.UI_STARMAP_STAR_OPACITY_FACTOR);
        this._color = rgbToRgba(...this.color, Math.min(1, this._opacity * frameCache.UI_STARMAP_STAR_OPACITY_SHIFT));

        this.vecToCamera = normalizeVec3(subtractVectorsCopy(this._cartesian, loadGD(UI_CAMERA_OFFSET_VEC)));
        this.shouldRenderStarThisFrameFlag = this.shouldRenderStarThisFrame();
        this.recalculateScreenFlag = false;
        cartesianToScreenInplace(this._cartesian, this._camera, this._screen);
    }

    prepare(frameCache) {
        if (this.recalculateScreenFlag) {
            this.recalculateScreen(frameCache);
        }
        cartesianToScreenInplace(this._cartesian, this._camera, this._screen);
        if (this._screen[2] < 0)
            return;

        this._renderNorm[0] = (this._screen[0] / this._screen[2]);
        this._renderNorm[1] = (this._screen[1] / this._screen[2]);
        this._renderScreen[0] = (this._renderNorm[0] + frameCache._xOffset) * frameCache._s;
        this._renderScreen[1] = (this._renderNorm[1] + frameCache._yOffset) * frameCache._s;
    }
    shouldRenderStarThisFrame() {
        if (dotVec3Copy(getForwardVec(), this.vecToCamera) > 0) {
            this.shouldRenderStarThisFrameFlag = true;
        } else {
            this.shouldRenderStarThisFrameFlag = false;
        }
    }
    render() {
        if (this._screen == null || this._screen[2] < 0) {
            return;
        }
        addRenderJob(new PointRenderJob(
            this._renderScreen[0],
            this._renderScreen[1],
            this._screen[2],
            this._size, this._color));

    }

}

class FrameCache {
    constructor() {
        this.UI_STARMAP_STAR_MAX_SIZE = null;
        this.UI_STARMAP_STAR_SIZE_FACTOR = null;
        this.UI_STARMAP_STAR_OPACITY_FACTOR = null;
        this.UI_STARMAP_BRIGHTNESS_SHIFT = null;
        this.UI_STARMAP_STAR_OPACITY_SHIFT = null;
        this.UI_CAMERA_OFFSET_VEC = null;
        this.UI_STARMAP_ZOOM = null;
    }

    prepareFrameCache() {
        frameMatrixReset();
        this.UI_STARMAP_STAR_MAX_SIZE = loadGD(UI_STARMAP_STAR_MAX_SIZE);
        this.UI_STARMAP_STAR_SIZE_FACTOR = loadGD(UI_STARMAP_STAR_SIZE_FACTOR);
        this.UI_STARMAP_STAR_OPACITY_FACTOR = loadGD(UI_STARMAP_STAR_OPACITY_FACTOR);
        this.UI_STARMAP_BRIGHTNESS_SHIFT = loadGD(UI_STARMAP_BRIGHTNESS_SHIFT);
        this.UI_STARMAP_STAR_OPACITY_SHIFT = loadGD(UI_STARMAP_STAR_OPACITY_SHIFT);
        this.UI_STARMAP_ZOOM = loadGD(UI_STARMAP_ZOOM)
        this.UI_CAMERA_OFFSET_VEC = loadGD(UI_CAMERA_OFFSET_VEC);

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);

    }
}


export class StarHandler {
    constructor() {
        this.frameCache = new FrameCache();
        this.initalizeData();
        this.valueWatchTick();
    }

    valueWatchTick() {
        this.watchedValues = {
            UI_STARMAP_ZOOM: loadGD(UI_STARMAP_ZOOM),
            UI_STARMAP_STAR_MIN_SIZE: loadGD(UI_STARMAP_STAR_MIN_SIZE),
            UI_STARMAP_STAR_MAX_SIZE: loadGD(UI_STARMAP_STAR_MAX_SIZE),
            UI_STARMAP_STAR_SIZE_FACTOR: loadGD(UI_STARMAP_STAR_SIZE_FACTOR),
            UI_STARMAP_STAR_OPACITY_FACTOR: loadGD(UI_STARMAP_STAR_OPACITY_FACTOR),
            UI_STARMAP_STAR_OPACITY_SHIFT: loadGD(UI_STARMAP_STAR_OPACITY_SHIFT),
            UI_STARMAP_BRIGHTNESS_SHIFT: loadGD(UI_STARMAP_BRIGHTNESS_SHIFT),
            UI_STARMAP_SHOW_CONSTELLATION_NAMES: loadGD(UI_STARMAP_SHOW_CONSTELLATION_NAMES)
        }
    }

    watchValues() {
        let setFlag = false;
        for (const [key, prevValue] of Object.entries(this.watchedValues)) {
            if (prevValue == 0) {
                continue;
            }
            let curValueDiff = loadGD(key) / prevValue;
            if (Math.abs(1 - curValueDiff) > .0001) {
                setFlag = true;
                break;
            }
        }

        this.valueWatchTick();

        if (setFlag) {
            for (let i = 0; i < this.starIds.length; i++) {
                this.stars[this.starIds.at(i)].recalculateScreenFlag = true;
            }
        }
    }


    initalizeData() {
        this.stars = new Array(118323); // Highest ID in the Hippacros catalog. 
        this.starsProcessedRenderRow = new Array(118323)
        this.starIds = new Array();

        this.constellations = new Array();
        this.constellationNames = new Map();
        this.constellationStars = new Set();
        this.starNames = new Map();
        this.starsConstellations = new Map();

        fetch("./static/climate/stars/lib/stellarium/constellations.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellations(text));

        fetch("./static/climate/stars/lib/stellarium/constellation_names.eng.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellationNames(text));

        fetch("./static/climate/stars/lib/hip_main.dat").then((resp) => resp.text())
            .then((text) => this.loadHIPStars(text))

        fetch("./static/climate/stars/lib/stellarium/star_names.fab").then((resp) => resp.text())
            .then((text) => this.loadStarNames(text))

    }

    loadConstellations(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadConstellationRow(rows.at(i));
        }
    }

    loadConstellationRow(row) {
        let constellation = new Constellation(row);
        this.constellationNames.set(constellation.name, constellation);
        this.constellations.push(constellation);
        constellation.uniqueStars.forEach((star) => this.constellationStars.add(star));
    }

    loadConstellationNames(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadConstellationNameRow(rows.at(i));
        }
    }

    loadConstellationNameRow(row) {
        let data = row.split("\t").map((a) => a.trim()).filter((a) => a.length >= 3);
        if (data.length < 2)
            return;
        let name = data[0];
        let eng = data[1].slice(1, -1);
        let loadedRef = this.constellationNames.get(name);
        if (loadedRef != null)
            loadedRef.englishName = eng;
    }

    loadHIPStars(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadHIPRow(rows.at(i));
        }
    }

    loadHIPRow(row) {
        let id = Number.parseInt(row.substr(8, 13));
        // THROTTLE - FOR COWARDS 
        // if (!this.constellationStars.has(id) && Math.random() > .015)
        //     return;

        let raHours = Number.parseFloat(row.substr(17, 2));
        let raMinutes = Number.parseFloat(row.substr(20, 2));
        let raSeconds = Number.parseFloat(row.substr(23, 5));

        let signDec = row.substr(29, 1);
        let degressDec = Number.parseFloat(row.substr(30, 2));
        let minutesDec = Number.parseFloat(row.substr(33, 2));
        let secondsDec = Number.parseFloat(row.substr(36, 5));

        let parallax = isNaN(Number.parseFloat(row.substr(79, 7))) ? 0 : Number.parseFloat(row.substr(79, 7));
        let magnitude = Number.parseFloat(row.substr(41, 5));
        let bv = Number.parseFloat(row.substr(245, 5));

        if (isNaN(bv) || magnitude < 0)
            return;

        // "Luminosity Formula for Absolute Magnitude". Max value is 85.5066712885
        // https://resources.wolframcloud.com/FormulaRepository/resources/Luminosity-Formula-for-Absolute-Magnitude
        // in degrees
        let rowAsc = (raHours + raMinutes / 60 + raSeconds / 3600) * (360 / 24); // between 0 and 360
        let rowDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600; // between -90 and 90

        // convert to radians 
        let rowAscRad = rowAsc / 57.295779513;
        let rowDecRad = rowDec / 57.295779513;

        let temperature = this.calculateStarTemperature(bv);
        let color = tempToColorForStar(temperature);
        if (isNaN(rowAsc) || isNaN(rowDec) || isNaN(magnitude) || isNaN(parallax)) {
            return;
        }

        let star = new Star(id, rowAscRad, rowDecRad, magnitude, color, parallax);
        this.stars[id] = star;
        this.starIds.push(id);
    }
    calculateStarTemperature(bv) {
        // https://web.archive.org/web/20230315074349/https://spiff.rit.edu/classes/phys445/lectures/colors/colors.html
        // https://iopscience.iop.org/article/10.1086/301490/pdf
        // https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
        return 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));
    }

    loadStarNames(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadStarNameRow(rows.at(i));
        }
    }

    loadStarNameRow(row) {
        let parts = row.trim().split("|_(");
        if (parts.length < 2) {
            return;
        }
        let id = parts[0];
        let name = parts[1].slice(1, -2)
        this.starNames.set(parseInt(id), name);
    }

    render() {
        this.watchValues();
        this.renderStars();
        this.renderConstellations();
    }

    renderStars() {
        this.frameCache.prepareFrameCache();
        for (let i = 0; i < this.starIds.length; i++) {
            let id = this.starIds[i];
            let star = this.stars[id];
            star.prepare(this.frameCache);
            star.render();
        }
    }


    renderConstellations() {
        if (loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) == 0) {
            return;
        }

        this.constellations.forEach((constellation) => {
            for (let i = 0; i < constellation.length; i++) {
                let segment = constellation.segments[i];
                let from = segment[0];
                let to = segment[1];

                let fromStar = this.stars[from];
                let toStar = this.stars[to];

                if (fromStar?._renderScreen == null || toStar?._renderScreen == null) {
                    return;
                }

                if (fromStar._screen[2] < 0 || toStar._screen[2] < 0) {
                    return;
                }
                addRenderJob(new LineRenderJob(fromStar._renderScreen, toStar._renderScreen, loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS), fromStar._color, fromStar._screen[2]));

            }


        })
    }




}