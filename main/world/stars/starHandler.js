import { calculateStatistics, combineColorMultArr, combineColorMultArrDest, hsv2rgb, invlerp, lerp } from "../../common.js";
import { NOSTAR } from "../../index.js";
import { getStarHandler } from "../../main.js";
import { frameMatrixReset, tickFrameMatrix } from "../../rendering/camera.js";
import { LineRenderJob } from "../../rendering/model/LineRenderJob.js";
import { addRenderJob, getNoSortRenderJobsLength } from "../../rendering/rasterizer.js";
import { WaterSquare } from "../../squares/WaterSquare.js";
import { astronomyAtlasSetupChoices } from "../../ui/components/AstronomyAtlas/modes/AstronomyAtlasModeFuncSetup.js";
import { loadGD, saveGD, UI_AA_LABEL_GRAPH, UI_AA_LABEL_STARS, UI_AA_PLOT_SELECT_NAMED_STARS, UI_AA_PLOT_XKEY, UI_AA_PLOT_YKEY, UI_AA_SETUP_COLORMODE, UI_AA_SETUP_MIN, UI_AA_SETUP_POW, UI_AA_SETUP_WINDOW_SIZE, UI_CAMERA_OFFSET_VEC_DT, UI_SH_COLORSHIFT, UI_SH_MINLUMINENCE, UI_SH_MINMODE, UI_SH_TARGETNUMSTARS, UI_STARMAP_CONSTELATION_BRIGHTNESS } from "../../ui/UIData.js";
import { HipparcosCatalog } from "./catalog/HipparcosCatalog.js";
import { PastelCatalog } from "./catalog/PastelCatalog.js";
import { StellariumCatalog } from "./catalog/StellariumCatalog.js";
import { getVec3Length } from "./matrix.js";
import { StarSector } from "./model/StarSector.js";
import { adjustBoundsToIncludePoint, cartesianToSectorIndex, getSectorSize, sectorToCartesian, sectorToCartesianBounds } from "./starHandlerUtil.js";


export class StarHandler {
    constructor() {
        this.sectors = new Map();
        this.constellations = new Array();
        this.stars = new Map(); // HIP id
        this.hdMap = new Map(); // HD id
        this.constellationStars = new Set();

        this.numSectorsArr = 1;
        this.bounds = [-1, -1, -1, 1, 1, 1]; // xMin, yMin, zMin, xMax, yMax, zMax. 
        this.loadData();
    }

    minLumensRuntime() {
        if (loadGD(UI_SH_MINMODE) != 0) {
            return;
        }
        let targetNumStars = loadGD(UI_SH_TARGETNUMSTARS);
        let curNumStars = getNoSortRenderJobsLength();

        let frac = curNumStars / targetNumStars;

        let dx = .1 * (1 - frac);

        saveGD(UI_SH_MINLUMINENCE,
            Math.min(Math.max(loadGD(UI_SH_MINLUMINENCE) - dx, 0), 5)
        );
    }

    resetStarLabels() {
        let graphLabelType = loadGD(UI_AA_LABEL_GRAPH);
        let starLabelType = loadGD(UI_AA_LABEL_STARS);
        let selectNamedStars = loadGD(UI_AA_PLOT_SELECT_NAMED_STARS);

        let aX = loadGD(UI_AA_PLOT_XKEY);
        let aY = loadGD(UI_AA_PLOT_YKEY);
        let aC = loadGD(UI_AA_SETUP_COLORMODE);


        let stars = new Array();
        this.iterateOnSectors((sector) => stars.push(...sector.loadedStars));

        stars.forEach((star) => {
            star.starLabel = star.getLabelForType(starLabelType, selectNamedStars, aX, aY, aC);
            star.graphLabel = star.getLabelForType(graphLabelType, selectNamedStars, aX, aY, aC);
        });
    }

    reprocessStarAltColoration() {
        if (getStarHandler().paramStatistics == null) {
            return;
        }

        this._rac_curKey = loadGD(UI_AA_SETUP_COLORMODE);
        if (this._rac_curKey == null || this._rac_curKey == "default") {
            return;
        }
        this._rac_st = getStarHandler().paramStatistics.get(this._rac_curKey);

        this._rac_minValue = loadGD(UI_AA_SETUP_MIN);
        this._rac_windowSize = loadGD(UI_AA_SETUP_WINDOW_SIZE);
        this._rac_maxValue = lerp(this._rac_minValue, 1, this._rac_windowSize);
        this._rac_powValue = loadGD(UI_AA_SETUP_POW);

        let sq = new WaterSquare(-1, -1);
        let hsv = sq.getColorBaseHsv();
        let hsv2 = [hsv[0] + loadGD(UI_SH_COLORSHIFT), hsv[1], hsv[2]];

        let rgb = hsv2rgb(...hsv);
        let rgb2 = hsv2rgb(...hsv2);
        
        rgb[0] *= 255;
        rgb[1] *= 255;
        rgb[2] *= 255;
        rgb2[0] *= 255;
        rgb2[1] *= 255;
        rgb2[2] *= 255;

        this.stars.values().forEach((star) => {
            this._rac_val = star[this._rac_curKey];
            star._rac_val = star[this._rac_curKey];
            
            if (this._rac_val == null) {
                return;
            }

            this._rac_valNorm = Math.max(
                this._rac_minValue,
                Math.min(
                    this._rac_maxValue,
                    invlerp(this._rac_st[2], this._rac_st[3], this._rac_val)
                )
            );

            this._rac_valNorm = Math.max(this._rac_valNorm, this._rac_minValue);
            this._rac_valNorm = Math.min(this._rac_valNorm, this._rac_maxValue);

            this._rac_v = invlerp(this._rac_minValue, this._rac_maxValue, this._rac_valNorm) ** this._rac_powValue;

            combineColorMultArrDest(
                rgb,
                rgb2,
                this._rac_v,
                star.alt_color
            );
        });

        this.iterateOnSectors((sector) => sector._recalculateStarColorFlag = true);
    }


    render() { 
        if (NOSTAR) {
            return;
        }
        this.iterateOnSectors((sector) => sector.renderMain());
        this.renderConstellations();
        this.minLumensRuntime();
    }

    rebuildSectors() {
        this.sectors = new Map();

        let sectorSize = 100;
        this.numSectorsArr = [
            (this.bounds[3] - this.bounds[0]) / sectorSize,
            (this.bounds[4] - this.bounds[1]) / sectorSize,
            (this.bounds[5] - this.bounds[2]) / sectorSize
        ];

    }

    addStarToSector(star) {
        this.sectors.set(star.sector[0], this.sectors.get(star.sector[0]) ?? new Map());
        this.sectors.get(star.sector[0]).set(
            star.sector[1],
            this.sectors.get(star.sector[0]).get(star.sector[1])
            ?? new Map());
        let curSector = this.sectors.get(star.sector[0]).get(star.sector[1]);
        if (!curSector.has(star.sector[2])) {
            curSector.set(star.sector[2], new StarSector(
                star.sector,
                star.cartesian,
                sectorToCartesianBounds(this.bounds, star.sector, this.numSectorsArr)
            ));
        }
        curSector.get(star.sector[2]).loadStar(star);
    }

    iterateOnSectors(func) {
        this.sectors.keys().forEach(
            (x) => this.sectors.get(x).keys().forEach(
                (y) => this.sectors.get(x).get(y).keys().forEach(
                    (z) => func(this.sectors.get(x).get(y).get(z))
                )));
    }

    loadStar(star) {
        this.loadedStars.push(star);
        this.stars.set(star.id, star);
        this.hdMap.set(star.hd_number, star);
    }

    loadConstellation(constellation) {
        this.loadedConstellations.push(constellation);
        constellation.uniqueStars.forEach((star) => {
            let starRef = this.stars.get(star);
            starRef?.sector?.constellationStars.add(starRef);
        });
    }

    loadData() {
        this.loadedStars = new Array();
        this.loadedConstellations = new Array();

        let hipCatalog = new HipparcosCatalog((star) => this.loadStar(star), (constellation) => this.loadConstellation(constellation));
        let stelCatalog = new StellariumCatalog((star) => this.loadStar(star), (constellation) => this.loadConstellation(constellation));
        let pastelCatalog = new PastelCatalog
        hipCatalog.loadData(() => {
            this.processDataStar();
            pastelCatalog.loadData(() => this.processStarStatistics());
            // stelCatalog.loadData()
        })
    };

    dataLoadedStar() {
        this.processDataStar();
    }

    processDataStar() {
        this.loadedStars.forEach((star) => {
            adjustBoundsToIncludePoint(this.bounds, star.cartesian);
        })

        this.rebuildSectors();

        this.loadedStars.forEach((star) => {
            star.sector = cartesianToSectorIndex(this.bounds, star.cartesian, this.numSectorsArr);
            this.addStarToSector(star);
        });

        this.iterateOnSectors((sector) => sector.procesLoadedStars());
    }

    processStarStatistics() {
        let params = new Array();
        this.paramStatistics = new Map();

        for (let i = 0; i < astronomyAtlasSetupChoices.length; i++) {
            let row = astronomyAtlasSetupChoices[i];
            for (let j = 0; j < row.length; j++) {
                params.push(row[j][0]);
            }
        };

        params.slice(1).forEach((param) => {
            let st = calculateStatistics(Array.from(this.stars.values().map((s) => s[param]).filter((v) => v != null)));
            this.paramStatistics.set(param, st);
        });
    }

    renderConstellations() {
        if (loadGD(UI_STARMAP_CONSTELATION_BRIGHTNESS) == 0) {
            return;
        }

        this.loadedConstellations.forEach((constellation) => {
            for (let i = 0; i < constellation.length; i++) {
                let segment = constellation.segments[i];
                let from = segment[0];
                let to = segment[1];

                let fromStar = this.stars.get(from);
                let toStar = this.stars.get(to);

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