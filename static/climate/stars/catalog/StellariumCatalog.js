import { getStarHandler } from "../../../main.js";
import { Constellation } from "../model/Constellation.js";
import { CatalogHandlerBase } from "./CatalogHandlerBase.js";

export class StellariumCatalog extends CatalogHandlerBase {
    constructor(starCallback, constellationCallback) {
        super(starCallback, constellationCallback);
        this.name = "StellariumCatalog";
    }

    loadData() {
        fetch("./static/climate/stars/catalogSource/stellarium/constellations.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellations(text))

        // fetch("./static/climate/stars/catalogSource/stellarium/constelation_names_eng.fab").then((resp) => resp.text())
        //     .then((text) => this.loadConstellationNames(text))
        //     .then(() => this.execCallback());
    }

    loadConstellations(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadConstellationRow(rows.at(i));
        }
    }

    loadConstellationRow(row) {
        let constellation = new Constellation(row);
        this.constellationCallback(constellation);
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
}