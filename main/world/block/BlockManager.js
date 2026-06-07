import { ManipulationManager } from "./manipulation/ManipulationManager.js";

export class BlockManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.sectorSize = 25;
        this.manipulationManager = new ManipulationManager(this);
        this.sectors = new Map();
    }
    update() { 
        this.manipulationManager.update()
    }

    render() { 
        this.manipulationManager.render()
    }

    iterateOnSectors(func) {
        this.sectors.keys().forEach(
            (x) => this.sectors.get(x).keys().forEach(
                (y) => this.sectors.get(x).get(y).keys().forEach(
                    (z) => func(this.sectors.get(x).get(y).get(z))
                )));
    }
    rebuildSectors() {
        this.sectors = new Map();
    }


}