export class StellariumCatalog extends CatalogHandlerBase {
    constructor(starCallback, constellationCallback) {
        super(starCallback, constellationCallback);
        this.name = "StellariumCatalog";
    }
}