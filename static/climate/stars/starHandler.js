import { cartesianToScreenInplace, frameMatrixReset, screenToRenderScreen } from "../../camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../canvas.js";
import { hexToRgb, processColorLerpBicolor, processColorLerpBicolorPow, rgbToRgba, rgbToRgbaObj } from "../../common.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth } from "../../index.js";
import { setOrganismAddedThisClick } from "../../manipulation.js";
import { addRenderJob, LineRenderJob, PointLabelRenderJob } from "../../rasterizer.js";
import {
    loadGD, UI_STARMAP_ZOOM, UI_STARMAP_CONSTELATION_BRIGHTNESS,
    UI_STARMAP_STAR_MAX_SIZE,
    UI_STARMAP_STAR_SIZE_FACTOR,
    UI_STARMAP_STAR_OPACITY_FACTOR,
    UI_STARMAP_STAR_OPACITY_SHIFT,
    UI_STARMAP_BRIGHTNESS_SHIFT,
    UI_STARMAP_SHOW_CONSTELLATION_NAMES,
    UI_CAMERA_OFFSET_VEC,
    UI_STARMAP_STAR_MIN_MAGNITUDE,
    UI_STARMAP_FEH_MIN_VALUE,
    UI_STARMAP_FEH_WINDOW_SIZE,
    UI_STARMAP_FEH_POW,
    UI_STARMAP_VIEWMODE,
    UI_PLOTCONTAINER_FILTERMODE_STARS,
    UI_PLOTCONTAINER_SELECTRADIUS,
    addUIFunctionMap,
    UI_PLOTCONTAINER_LOCALITY_SELECTMODE,
    UI_PLOTCONTAINER_IDSYSTEM_STARS
} from "../../ui/UIData.js";
import { gsh, tempToColorForStar } from "../time.js";
import { calculateDistance, getVec3Length, subtractVectors, subtractVectorsCopy } from "./matrix.js";

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

let feHMinColor = hexToRgb("#99ffd8");
let feHMaxColor = hexToRgb("#be20e6");

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
    constructor(id, asc, dec, magnitude, bv, color, parallax, hd_number) {
        this.id = id;

        this.asc = asc;
        this.dec = dec;
        this.magnitude = magnitude;
        this.bv = bv;
        this.color = color;
        this.parallax = parallax;
        this.hd_number = hd_number;
        this._cartesian = [0, 0, 0];
        this._offset = [0, 0, 0];
        this._camera = [0, 0, 0];
        this._screen = [0, 0, 0];
        this._renderNorm = [0, 0];
        this._renderScreen = [0, 0, 0];
        this._size = 0;
        this._opacity = 0;
        this._brightness = 0;
        this._distance = 0;
        this._curCameraDistance = 1
        this._rootCameraDistance = 1;
        this._relCameraDist = 1;
        this.recalculateScreenFlag = true;
        this.recalculateColorFlag = true;

        this.parsecs = Math.abs(1 / (parallax / 1000));
        this.magnitude_absolute = (magnitude + 5) - (5 * Math.log10(this.parsecs));
    }

    setFeH(feH) {
        this.p_feH = feH;
        this.recalculateFeHColor();
    }

    recalculateFeHColor() {
        if (this.p_feH == null)
            return;

        let minValue = loadGD(UI_STARMAP_FEH_MIN_VALUE);
        let maxValue = minValue + loadGD(UI_STARMAP_FEH_WINDOW_SIZE);

        let vfcc = Math.min(Math.max(minValue, this.p_feH), maxValue);

        if (isNaN(this.p_feH)) {
            console.warn("????");
        }
        this.p_feH_color = rgbToRgbaObj(processColorLerpBicolorPow(
            vfcc, minValue, maxValue, feHMinColor, feHMaxColor, loadGD(UI_STARMAP_FEH_POW)),1);
    }

    getActiveId(im) {
        switch (im) {
            case 0:
                return null;
            case 1:
                return this.id;
            case 2:
            default:
                return this.hd_number;
        }
    }

    recalculateScreen(frameCache) {
        this._distance = this.parsecs * (10 ** frameCache.UI_STARMAP_ZOOM);
        sphericalToCartesianInplace(this._cartesian, frameCache.UI_CAMERA_OFFSET_VEC, -this.asc, -this.dec, this._distance);
        this._rootCameraDistance = getVec3Length(this._cartesian);
        this.recalculateScreenFlag = false;
        this.recalculateFeHColor();
    }

    recalculateSizeOpacityColor(frameCache) {
        if (this._prevRelCameraDist == null || this.recalculateColorFlag || this._relCameraDist / this._prevRelCameraDist < 0.9 || this._prevRelCameraDist / this._relCameraDist < 0.9) {
            this.recalculateColorFlag = false;
            this._prevRelCameraDist = this._relCameraDist;
            this._brightness = brightnessValueToLumensNormalized((this.magnitude) + frameCache.UI_STARMAP_BRIGHTNESS_SHIFT) / (this._relCameraDist ** 2);
            this._size = (this._brightness ** frameCache.UI_STARMAP_STAR_SIZE_FACTOR) * frameCache.UI_STARMAP_STAR_MAX_SIZE;
            this._opacity = (this._brightness ** frameCache.UI_STARMAP_STAR_OPACITY_FACTOR);
            this._color = rgbToRgba(...this.color, Math.min(1, this._opacity * frameCache.UI_STARMAP_STAR_OPACITY_SHIFT));
            
        }
    }

    doLocalitySelect(selectMode, selectRadius) {
        if (selectMode == 0) {
            this.localitySelect = false;
            return false;
        } else {
            if (this._curCameraDistance < Math.exp(selectRadius)) {
                if (this.localitySelect)
                    return false;
                this.localitySelect = true;
                return true;
            } else {
                if (selectMode != 2) {
                    this.localitySelect = false;
                }
                return false;
            }
        }
    }

    prepare(frameCache) {
        this._curCameraDistance = calculateDistance(frameCache.UI_CAMERA_OFFSET_VEC, this._cartesian);
        this._relCameraDist = (this._curCameraDistance / this._rootCameraDistance);
        
        frameCache.newStarSelected |= this.doLocalitySelect(frameCache.UI_PLOTCONTAINER_LOCALITY_SELECTMODE, frameCache.UI_PLOTCONTAINER_SELECTRADIUS);

        if (this.recalculateScreenFlag) {
            this.recalculateScreen(frameCache);
            this._prevRelCameraDist = null;
        }

        this.recalculateSizeOpacityColor(frameCache);
        
        this._offset[0] = this._cartesian[0] - frameCache.UI_CAMERA_OFFSET_VEC[0];
        this._offset[1] = this._cartesian[1] - frameCache.UI_CAMERA_OFFSET_VEC[1];
        this._offset[2] = this._cartesian[2] - frameCache.UI_CAMERA_OFFSET_VEC[2];

        cartesianToScreenInplace(this._offset, this._camera, this._screen);
        screenToRenderScreen(this._screen, this._renderNorm, this._renderScreen, frameCache._xOffset, frameCache._yOffset, frameCache._s);

        if (this.selected || this.localitySelect) {
            this.activeId = (frameCache.UI_PLOTCONTAINER_IDSYSTEM_STARS == 0) ? this.id : this.hd_number;
        }
    }
    render(renderMode, renderLabel) {
        this.fovVisible = false;
        if (this._screen == null || this._screen[2] < 0) {
            return;
        }
        if (this._renderScreen[0] < 0 || this._renderScreen[0] > getTotalCanvasPixelWidth()) {
            return;
        }
        if (this._renderScreen[1] < 0 || this._renderScreen[1] > getTotalCanvasPixelHeight()) {
            return;
        }

        this.fovVisible = true;

        addRenderJob(new PointLabelRenderJob(
            this._renderScreen[0],
            this._renderScreen[1],
            this._screen[2],
            this._size,  
            (renderMode == 0 ? this._color : (this.p_feH_color ?? this._color)), 
            ((renderLabel) && (this.selected || this.localitySelect)) ? this.activeIdStar : null), 
            false);
    }
}

class FrameCache {
    constructor() {
        this.prepareFrameCache();
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
        this.UI_STARMAP_VIEWMODE = loadGD(UI_STARMAP_VIEWMODE);
        this.UI_PLOTCONTAINER_LOCALITY_SELECTMODE = loadGD(UI_PLOTCONTAINER_LOCALITY_SELECTMODE);
        this.UI_PLOTCONTAINER_SELECTRADIUS = loadGD(UI_PLOTCONTAINER_SELECTRADIUS);

        this._cw = getCanvasWidth();
        this._ch = getCanvasHeight();
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
        
        this.newStarSelected = false;

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
            UI_STARMAP_SHOW_CONSTELLATION_NAMES: loadGD(UI_STARMAP_SHOW_CONSTELLATION_NAMES),
            UI_STARMAP_FEH_MIN_VALUE: loadGD(UI_STARMAP_FEH_MIN_VALUE),
            UI_STARMAP_FEH_WINDOW_SIZE: loadGD(UI_STARMAP_FEH_WINDOW_SIZE),
            UI_STARMAP_FEH_POW: loadGD(UI_STARMAP_FEH_POW),
            UI_STARMAP_VIEWMODE: loadGD(UI_STARMAP_VIEWMODE),
        }

        this.colorWatchValues = {
            UI_STARMAP_STAR_MAX_SIZE: loadGD(UI_STARMAP_STAR_MAX_SIZE),
            UI_STARMAP_STAR_SIZE_FACTOR: loadGD(UI_STARMAP_STAR_SIZE_FACTOR),
            UI_STARMAP_STAR_OPACITY_FACTOR: loadGD(UI_STARMAP_STAR_OPACITY_FACTOR),
            UI_STARMAP_STAR_OPACITY_SHIFT: loadGD(UI_STARMAP_STAR_OPACITY_SHIFT),
            UI_STARMAP_BRIGHTNESS_SHIFT: loadGD(UI_STARMAP_BRIGHTNESS_SHIFT)
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

        let setColorFlag = false;
        for (const [key, prevValue] of Object.entries(this.colorWatchValues)) {
            if (prevValue == 0) {
                continue;
            }
            let curValueDiff = loadGD(key) / prevValue;
            if (Math.abs(1 - curValueDiff) > .0001) {
                setColorFlag = true;
                break;
            }
        }

        this.valueWatchTick();

        if (setFlag) {
            for (let i = 0; i < this.starIds.length; i++) {
                this.stars[this.starIds.at(i)].recalculateScreenFlag = true;
            }
        }

        if (setColorFlag) {
            for (let i = 0; i < this.starIds.length; i++) {
                this.stars[this.starIds.at(i)].recalculateColorFlag = true;
            }
        }
    }


    initalizeData() {
        this.stars = new Array(118323); // Highest ID in the Hippacros catalog. 
        this.starsProcessedRenderRow = new Array(118323)
        this.starIds = new Array();
        this.hdMap = new Map();

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
            .then((_) => {
                fetch("./static/climate/stars/lib/metallicity/pastel.dat").then((resp) => resp.text())
                    .then((text) => this.loadPASTEL(text))
            });

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

        let parallax = Number.parseFloat(row.substr(79, 7));
        let magnitude = Number.parseFloat(row.substr(41, 5));
        let bv = Number.parseFloat(row.substr(245, 5));

        let hd_number = Number.parseInt(row.substr(390, 6));

        if (isNaN(bv) || isNaN(parallax) || magnitude < 0)
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

        let star = new Star(id, rowAscRad, rowDecRad, magnitude, bv, color, parallax, hd_number);
        this.stars[id] = star;
        this.starIds.push(id);
        this.hdMap.set(hd_number, star);
    }

    loadPASTEL(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadPASTELRow(rows.at(i));
        }
    }

    loadPASTELRow(row) {
        try {
            let designation = row.substr(0, 32);
            let feH = Number.parseFloat(row.substr(166, 6));

            if (designation.substr(0, 2) === "HD" && !isNaN(feH)) {
                let designationParts = designation.match(/\S+/g)
                let hdId = Number.parseInt(designationParts[1]);
                if (this.hdMap.has(hdId)) {
                    this.hdMap.get(hdId).setFeH(feH);
                    // console.log("Set FeH ", feH, " for HIP star ", this.hdMap.get(hdId).id);
                } else {
                    // console.log("HD Lookup failed for PASTEL designation " + designation);
                }
            }

        } catch (error) { // ignored
        }

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
        let mm = loadGD(UI_STARMAP_STAR_MIN_MAGNITUDE);
        let fm = loadGD(UI_PLOTCONTAINER_FILTERMODE_STARS);
        let im = loadGD(UI_PLOTCONTAINER_IDSYSTEM_STARS);

        for (let i = 0; i < this.starIds.length; i++) {
            let id = this.starIds[i];
            let star = this.stars[id];
            
            if (star.magnitude > mm) {
                star.mmVisible = false; 
                continue;
            } else {
                star.mmVisible = true;
            }
            if (this.frameCache.UI_STARMAP_VIEWMODE == 1 && star.p_feH == null) {
                continue;
            }
            star.prepare(this.frameCache);

            if (fm == 1) {
                if (!star.graphVisible) {
                    continue;
                }
            } else if (fm == 2) {
                if (!(star.selected || star.localitySelect) ) {
                    continue;
                }
            }
            star.activeIdStar = star.getActiveId(im);
            star.render(this.frameCache.UI_STARMAP_VIEWMODE, im > 0);
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
                addRenderJob(
                    new LineRenderJob(
                        fromStar._renderScreen,
                        toStar._renderScreen,
                        loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS),
                        fromStar._color,
                        fromStar._screen[2]
                    ), false);
            }
        })
    }
}
