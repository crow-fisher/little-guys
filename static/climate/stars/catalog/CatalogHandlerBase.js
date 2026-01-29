export class CatalogHandlerBase {
    constructor(starCallback, constellationCallback) {
        this.starCallback = starCallback;
        this.constellationCallback = constellationCallback;
        this.name = "BaseCatalog";
    }

    loadData() {

    }
}