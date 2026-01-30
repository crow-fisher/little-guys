import { calculateStatistics } from "../../../common.js";
import { astronomyAtlasSetupChoices } from "../../../ui/components/AstronomyAtlas/modes/AstronomyAtlasModeFuncSetup.js";
import { tempToColorForStar } from "../../time.js";
import { Star } from "../model/Star.js";
import { calculateStarTemperature } from "../starHandlerUtil.js";
import { CatalogHandlerBase } from "./CatalogHandlerBase.js";

export class HipparcosCatalog extends CatalogHandlerBase {
    constructor(starCallback, constellationCallback) {
        super(starCallback, constellationCallback);
        this.name = "HipparcosCatalog";
    }

    loadData(callback) {
        fetch("./static/climate/stars/catalogSource/hipparcos/hip_main.dat").then((resp) => resp.text())
            .then((text) => this.loadHIPStars(text))
            .then(callback);
    }

    loadHIPStars(text) {
        let rows = text.split("\n");
        for (let i = 0; i < Math.min(10 ** 5, rows.length); i++) {
            this.loadHIPRow(rows.at(i));
        }
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

        if (isNaN(bv) || isNaN(parallax) || !isFinite(parallax) || parallax == 0 || magnitude < 0)
            return;

        let rowAsc = (raHours + raMinutes / 60 + raSeconds / 3600) * (360 / 24); // between 0 and 360
        let rowDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600; // between -90 and 90

        // convert to radians 
        let rowAscRad = rowAsc / 57.295779513;
        let rowDecRad = rowDec / 57.295779513;

        let temperature = calculateStarTemperature(bv);
        let color = tempToColorForStar(temperature);
        if (isNaN(rowAsc) || isNaN(rowDec) || isNaN(magnitude) || isNaN(parallax)) {
            return;
        }
        this.starCallback(new Star(id, rowAscRad, rowDecRad, magnitude, bv, color, parallax, hd_number, temperature));
    }
}