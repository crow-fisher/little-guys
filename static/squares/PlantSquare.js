import { BaseSquare } from "./BaseSqaure.js";
class PlantSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "PlantSquare";
        this.organic = true;
        this.physicsEnabled = false;
        this.collision = false;
        this.visible = false;
        this.rootable = false;
        this.opacity = 0.3;
    }
    physics() {}
    physicsBefore() {}
}

export {PlantSquare}