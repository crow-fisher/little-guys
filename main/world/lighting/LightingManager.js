import { LightSource } from "./model/LightSource.js";

export class LightingManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.lightSources = [new LightSource(this)];
    }

    update() {
        this.lightSources.forEach((ls) => ls.update());
    }
}