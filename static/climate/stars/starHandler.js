import { frameMatrixReset, tickFrameMatrix } from "../../camera.js";
import { HipparcosCatalog } from "./catalog/HipparcosCatalog.js";
import { StellariumCatalog } from "./catalog/StellariumCatalog.js";
import { StarSector } from "./model/StarSector.js";
import { adjustBoundsToIncludePoint, cartesianToSectorIndex, getSectorSize, sectorToCartesian, sectorToCartesianBounds } from "./starHandlerUtil.js";


export class StarHandler {
    constructor() {
        this.dataCatalogs = [HipparcosCatalog];
        this.sectors = new Map();
        this.numSectorsArr = 1;
        this.bounds = [-1, -1, -1, 1, 1, 1]; // xMin, yMin, zMin, xMax, yMax, zMax. 
        this.loadData();
    }

    render() {
        tickFrameMatrix();
        this.iterateOnSectors((sector) => sector.renderMain());
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

    loadData() {
        this.loadedStars = new Array();
        this.loadedConstellations = new Array();
        this.catalogStatusMap = new Map();
        this.dataCatalogs.forEach((Catalog) => {
            let curCatalog = new Catalog((star) => this.loadedStars.push(star), (constellation) => this.loadedConstellations.push(constellation));
            this.catalogStatusMap.set(curCatalog.name, 0);
            curCatalog.loadData(() => { this.catalogStatusMap.set(curCatalog.name, 1), this.dataLoadedCallback() });
        });
    };

    dataLoadedCallback() {
        if (this.catalogStatusMap.values().some((val) => val == 0)) {
            return;
        }
        this.processData();
    }

    processData() {
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

    _initalizeData() {
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
}