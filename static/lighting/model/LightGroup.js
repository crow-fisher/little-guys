export class LightGroup {
    constructor() {
        this.lightSources = [];
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
}