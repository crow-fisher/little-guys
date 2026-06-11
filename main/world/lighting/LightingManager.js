import { LightSource } from "./model/LightSource.js";

export class LightingManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.lightSources = [new LightSource(this)];
    }

    update() {
        let idx = 0;
        this.lightSources.forEach((ls) => ls.updateInit(idx++));
        
        this.worldManager.blockManager.iterateOnSectors(
            (sector) => sector.iterateOnBlocks(
                (block) => this.lightSources.forEach(
                    (ls) => ls.updateProcessBlock(block))));
        this.lightSources.forEach((ls) => ls.updateProcess());
    }
}