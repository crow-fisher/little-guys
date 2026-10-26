import { Plane } from "./manipulation/model/Plane.js";
import { PlaneManager } from "./PlaneManager.js";

export class StaticPlaneManager extends PlaneManager {
    constructor(blockManager) {
        super();
        this.blockManager = blockManager;
        this.backPlane = new Plane();
    }
}