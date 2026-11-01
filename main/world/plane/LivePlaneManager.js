import { Plane } from "./manipulation/model/Plane.js";
import { PlaneManager } from "./PlaneManager.js";

export class LivePlaneManager extends PlaneManager {
    constructor(blockManager) {
        super();
        this.blockManager = blockManager;
        
        this.soilPlane = new Plane();
        this.rockPlane = new Plane();
    }
}