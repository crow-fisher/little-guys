import { cartesianToScreen, renderVec } from "../../camera.js";
import { getBaseSize, getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { COLOR_BLUE, COLOR_VERY_FUCKING_RED, COLOR_WHITE } from "../../colors.js";
import { invlerp, randRange } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { addRenderJob, PointRenderJob } from "../../rasterizer.js";
import { loadGD, saveGD, UI_CAMERA_OFFSET_VEC, UI_MAIN_NEWWORLD_LATITUDE, UI_STARMAP_CONSTELATION_BRIGHTNESS, UI_STARMAP_NORMAL_BRIGTNESS, UI_STARMAP_ROTATION_VEC, UI_STARMAP_ROTATION_VEC_DT, UI_STARMAP_SHOW_CONSTELLATION_NAMES, UI_STARMAP_ZOOM } from "../../ui/UIData.js";
import { getActiveClimate } from "../climateManager.js";
import { getFrameRelCloud } from "../simulation/temperatureHumidity.js";
import { getCurDay, getDaylightStrength, tempToRgbaForStar } from "../time.js";
import { addVectors, addVectorsCopy, getVec3Length, multiplyMatrixAndPoint, multiplyVectorByScalar, normalizeVec3, subtractVectors, subtractVectorsCopy } from "./matrix.js";

class Constellation {
    constructor(data) {
        let row = data.split(" ");
        this.name = row[0];
        this.stars = new Set(data.trim().split(" ").slice(1).map((s) => s.trim()).map((s) => parseInt(s)))
    }

}
export class StarHandler {
    constructor() {
        this.initalizeData();
    }

    initalizeData() {
        this.stars = new Array();
        this.constellations = new Array();
        this.constellationNames = new Map();
        this.constellationStars = new Set();
        this.starsById = new Map();
        this.starsConstellations = new Map();

        fetch("./static/climate/stars/lib/stellarium/constellations.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellations(text));

        fetch("./static/climate/stars/lib/stellarium/constellation_names.eng.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellationNames(text));

        fetch("./static/climate/stars/lib/stellarium/hip_main.dat").then((resp) => resp.text())
            .then((text) => this.loadHIPStars(text))

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
        constellation.stars.forEach((star) => {
            if (!this.starsConstellations.has(star)) {
                this.starsConstellations.set(star, new Set())
            }
            this.starsConstellations.get(star).add(constellation);
            this.constellationStars.add(star);
        });
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
        if (!this.constellationStars.has(id) && Math.random() < 0.5)
            return;
        let raHours = Number.parseFloat(row.substr(17, 2));
        let raMinutes = Number.parseFloat(row.substr(20, 2));
        let raSeconds = Number.parseFloat(row.substr(23, 5));

        let signDec = row.substr(29, 1);
        let degressDec = Number.parseFloat(row.substr(30, 2));
        let minutesDec = Number.parseFloat(row.substr(33, 2));
        let secondsDec = Number.parseFloat(row.substr(36, 5));

        let parallax = Number.parseFloat(row.substr(79, 85));
        let brightness = Number.parseFloat(row.substr(230, 6));
        let bv = Number.parseFloat(row.substr(245, 5));

        if (isNaN(bv) || brightness < 0)
            return;

        brightness *= .4;

        // in degrees
        let rowAsc = (raHours + raMinutes / 60 + raSeconds / 3600) * (360 / 24); // between 0 and 360
        let rowDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600; // between -90 and 90

        // convert to radians 
        let rowAscRad = rowAsc / 57.295779513;
        let rowDecRad = rowDec / 57.295779513;

        let temperature = this.calculateStarTemperature(bv);
        let hex = tempToRgbaForStar(temperature);
        if (isNaN(rowAsc) || isNaN(rowDec) || isNaN(brightness) || isNaN(parallax)) {
            return;
        }
        let objArr = [id, rowAscRad, rowDecRad, brightness, hex, parallax];
        this.starsById.set(id, objArr);
        this.stars.push(objArr);
    }

    calculateStarTemperature(bv) {
        // https://web.archive.org/web/20230315074349/https://spiff.rit.edu/classes/phys445/lectures/colors/colors.html
        // https://iopscience.iop.org/article/10.1086/301490/pdf
        // https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
        return 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));
    }

    render() {
        this.renderStars();
    }

    renderStars() {
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html
        // this.renderWireframe();

        if (getDaylightStrength() > 0.35) {
            return;
        }
        let bMult = Math.min(1, Math.exp(-7 * getDaylightStrength()));
        let frameCloudColor = getFrameRelCloud();
        let frameCloudMult = 0;// Math.min(1, ((frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 20));

        this.ascOffset = (getCurDay() % 1) * 2 * Math.PI;
        this.decOffset = 0;

        for (let i = 0; i < this.stars.length; i++) {
            let row = this.stars[i];
            let processedRow = this.processStarRow(row, bMult, frameCloudColor, frameCloudMult);
            let cartesian = processedRow[0];
            let screen = cartesianToScreen(...cartesian);
            let origDistance = getVec3Length(cartesian);
            cartesian[1] *= -1;
            addVectors(cartesian, loadGD(UI_CAMERA_OFFSET_VEC))
            let newDistance = getVec3Length(cartesian);
            let distFactor = newDistance / origDistance;
            let brightnessFactor = 1 / distFactor;
            this.renderScreen(screen, processedRow[1] * brightnessFactor, processedRow[2]);
        }
    }

    processStarRow(row, bMult, frameCloudColor, frameCloudMult) {
        // all business logic for star row processing goes here 
        let rowAsc = row[1] + this.ascOffset;
        let rowDec = row[2] + this.decOffset;
        let rowBrightness = (row[3] ** 2) * bMult * (1 - frameCloudMult);
        let rowColor = row[4];
        let rowParallax = row[5];
        let phi = rowDec;
        let theta = rowAsc;
        let distance = 1 / rowParallax; // in parsecs. 
        let cartesian = this.sphericalToCartesian(phi, theta, distance);

        let constellations = this.starsConstellations.get(row[0]);
        if (constellations == null)
            return [cartesian, Math.exp(loadGD(UI_STARMAP_NORMAL_BRIGTNESS)) * rowBrightness, rowColor]

        if (loadGD(UI_STARMAP_SHOW_CONSTELLATION_NAMES)) {
            MAIN_CONTEXT.strokeStyle = COLOR_WHITE;
            let screen = cartesianToScreen(...cartesian);
            if (screen != null) {
                let curOffset = 0;
                constellations
                .forEach((constellation) => {
                    if (constellation.englishName != "Taurus") {
                        return;
                    }
                    
                    MAIN_CONTEXT.strokeText(
                        constellation.englishName,
                        screen[0],
                        screen[1] + curOffset
                    );
                    curOffset += 36;
                })
            }
        }

        return [cartesian, Math.exp(loadGD(UI_STARMAP_NORMAL_BRIGTNESS) + loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS)) * rowBrightness, rowColor];
    }

    sphericalToCartesian(pitch, yaw, distance) {
        let m = distance * 10 ** loadGD(UI_STARMAP_ZOOM);
        let x = m * Math.cos(yaw) * Math.cos(pitch);
        let y = -m * Math.sin(pitch);
        let z = m * Math.sin(yaw) * Math.cos(pitch);

        return [x, y, z];
    }

    renderScreen(loc, size, color) {
        if (loc) {
            if (size > .5)
                addRenderJob(new PointRenderJob(loc[0], loc[1], loc[2], size, color));
        }
    }

    renderConstellations() {
    }




}