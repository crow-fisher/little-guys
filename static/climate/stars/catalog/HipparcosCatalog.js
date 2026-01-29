export class HipparcosCatalog extends CatalogHandlerBase {
    constructor(starCallback, constellationCallback) {
        super(starCallback, constellationCallback);
        this.name = "HipparcosCatalog";
    }
}