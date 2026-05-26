import { StarManager } from "./stars/StarManager.js";

export class WorldManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.startManager = new StarManager(this);
    }
}