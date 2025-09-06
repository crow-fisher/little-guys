export class LightGroup {
    constructor() {
        this.lightSources = [];
    }
    getBrightness() {
        let out = {r: 0, g: 0, b: 0};
        this.lightSources
            .map((ls) => ls.getBrightness())
            .forEach(source => {
                out.r += source.r;
                out.g += source.g;
                out.b += source.b;
            });
        return out;
    }
    destroy() {
        this.lightSources.forEach((ls) => ls.destroy());
    }
}