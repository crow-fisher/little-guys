import { cartesianToScreenInplace, frameMatrixReset, screenToRenderScreen } from "../../rendering/camera.js";
import { getCanvasHeight, getCanvasWidth } from "../../canvas.js";
import { calculateStatistics, combineColorMult, hexToRgb, invlerp, lerp, processColorLerpBicolor, processColorLerpBicolorPow, processRangeToOne, rgbToRgba, rgbToRgbaObj } from "../../common.js";
import { getTotalCanvasPixelHeight, getTotalCanvasPixelWidth } from "../../index.js";
import { setOrganismAddedThisClick } from "../../manipulation.js";
import { addRenderJob, LineRenderJob, PointLabelRenderJob } from "../../rendering/rasterizer.js";
import { astronomyAtlasSetupChoices } from "../../ui/components/AstronomyAtlas/modes/AstronomyAtlasModeFuncSetup.js";
import {
    loadGD, UI_STARMAP_ZOOM, UI_STARMAP_CONSTELATION_BRIGHTNESS,
    UI_SH_MINSIZE,
    UI_SH_STYLE_SIZE_FACTOR,
    UI_SH_STYLE_BRIGHTNESS_FACTOR,
    UI_SH_STYLE_SIZE_SHIFT,
    UI_SH_STYLE_BRIGHTNESS_SHIFT,
    UI_STARMAP_SHOW_CONSTELLATION_NAMES,
    UI_CAMERA_OFFSET_VEC,
    UI_STARMAP_STAR_MIN_MAGNITUDE,
    UI_STARMAP_FEH_MIN_VALUE,
    UI_STARMAP_FEH_WINDOW_SIZE,
    UI_STARMAP_FEH_POW,
    UI_STARMAP_VIEWMODE,
    UI_AA_SELECT_FILTERMODE_STARS,
    UI_AA_PLOT_SELECTRADIUS,
    addUIFunctionMap,
    UI_AA_PLOT_LOCALITY_SELECTMODE,
    UI_AA_LABEL_STARS,
    UI_AA_SETUP_COLORMODE,
    UI_AA_SETUP_MIN,
    UI_AA_SETUP_WINDOW_SIZE,
    UI_AA_SETUP_POW,
    UI_AA_SETUP_MULT,
    UI_AA_LABEL_GRAPH,
    UI_AA_PLOT_XKEY,
    UI_AA_PLOT_YKEY,
    UI_AA_SETUP_SELECT_MULT,
    UI_STARMAP_STAR_MIN_SIZE,
    UI_AA_PLOT_SELECT_NAMED_STARS
} from "../../ui/UIData.js";
import { getAstronomyAtlasComponent } from "../../ui/WindowManager.js";
import { calculateDistance, getVec3Length, subtractVectors, subtractVectorsCopy } from "./matrix.js";

// https://resources.wolframcloud.com/FormulaRepository/resources/Luminosity-Formula-for-Absolute-Magnitude
// maximum value  85.5066712885

const feHMinColor = hexToRgb("#99ffd8");
const feHMaxColor = hexToRgb("#be20e6");



export class StarHandler {
    constructor() {
        this.frameCache = new FrameCache();
        this.initalizeData();
        this.valueWatchTick();
    }

    resetStarLabels() {
        let graphLabelType = loadGD(UI_AA_LABEL_GRAPH);
        let starLabelType = loadGD(UI_AA_LABEL_STARS);
        let selectNamedStars = loadGD(UI_AA_PLOT_SELECT_NAMED_STARS);

        let aX = loadGD(UI_AA_PLOT_XKEY);
        let aY = loadGD(UI_AA_PLOT_YKEY);
        let aC = loadGD(UI_AA_SETUP_COLORMODE);

        this.stars.forEach((star) => {
            star.starLabel = star.getLabelForType(starLabelType, selectNamedStars, aX, aY, aC);
            star.graphLabel = star.getLabelForType(graphLabelType, selectNamedStars, aX, aY, aC);
        });
    }

    valueWatchTick() {
        this.watchedValues = {
            UI_STARMAP_ZOOM: loadGD(UI_STARMAP_ZOOM)
        }

        this.colorWatchValues = {
            UI_SH_MINSIZE: loadGD(UI_SH_MINSIZE),
            UI_STARMAP_STAR_MIN_SIZE: loadGD(UI_STARMAP_STAR_MIN_SIZE),
            UI_SH_STYLE_SIZE_FACTOR: loadGD(UI_SH_STYLE_SIZE_FACTOR),
            UI_SH_STYLE_BRIGHTNESS_FACTOR: loadGD(UI_SH_STYLE_BRIGHTNESS_FACTOR),
            UI_SH_STYLE_SIZE_SHIFT: loadGD(UI_SH_STYLE_SIZE_SHIFT),
            UI_SH_STYLE_BRIGHTNESS_SHIFT: loadGD(UI_SH_STYLE_BRIGHTNESS_SHIFT)
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
                    .then((text) => this.loadPASTEL(text));

                fetch("./static/climate/stars/lib/stellarium/star_names.fab").then((resp) => resp.text())
                    .then((text) => this.loadStarNames(text))
            })

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

        let params = new Array;
        for (let i = 0; i < astronomyAtlasSetupChoices.length; i++) {
            let row = astronomyAtlasSetupChoices[i];
            for (let j = 0; j < row.length; j++) {
                params.push(row[j][0]);
            }
        };

        this.paramStatistics = new Map();
        params.slice(1).forEach((param) => {
            let st = calculateStatistics(this.stars.map((s) => s[param]).filter((v) => v != null));
            this.paramStatistics.set(param, st);
        });
    }

    loadHIPRow(row) {
        let id = Number.parseInt(row.substr(8, 13));

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

        let star = new Star(id, rowAscRad, rowDecRad, magnitude, bv, color, parallax, hd_number, temperature);
        this.stars[id] = star;
        this.starIds.push(id);
        this.hdMap.set(hd_number, star);
    }

    loadPASTEL(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadPASTELRow(rows.at(i));
        }
        let st = calculateStatistics(this.stars.map((s) => s.p_feH).filter((v) => v != null));
        this.paramStatistics.set("p_feH", st);
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
                }
            }

        } catch (error) { // ignored
        }

    }



    loadStarNames(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadStarNameRow(rows.at(i));
        }
        getAstronomyAtlasComponent().plotStarScatter.reloadGraph();
    }

    loadStarNameRow(row) {
        let parts = row.trim().split("|_(");
        if (parts.length < 2) {
            return;
        }
        let id = parts[0];
        let name = parts[1].slice(1, -2)
        let star = this.stars[parseInt(id)];
        if (star) {
            star.name = name;
            this.starNames.set(parseInt(id), name);
        }
    }

    render() {
        this.watchValues();
        this.renderStars();
        this.renderConstellations();
    }

    renderStars() {
        this.frameCache.prepareFrameCache();
        let fm = loadGD(UI_AA_SELECT_FILTERMODE_STARS);
        let im = loadGD(UI_AA_LABEL_STARS);
        let sm = loadGD(UI_AA_SETUP_COLORMODE);

        for (let i = 0; i < this.starIds.length; i++) {
            let id = this.starIds[i];
            let star = this.stars[id];

            star.prepare(this.frameCache);

            if (fm == 1) {
                if (!star.graphVisible) {
                    continue;
                }
            } else if (fm == 2) {
                if (!(star.selected || star.localitySelect)) {
                    continue;
                }
            }
            star.render(sm, im > 0);
        }

        if (this.frameCache.newStarSelected) {
            this.resetStarLabels();
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
