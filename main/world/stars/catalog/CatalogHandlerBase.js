export class CatalogHandlerBase {
    constructor(starManager, starCallback, constellationCallback) {
        this.starManager = starManager;
        this.starCallback = starCallback;
        this.constellationCallback = constellationCallback;
        this.name = "BaseCatalog";
    }

    loadData(callback) {

    }
}