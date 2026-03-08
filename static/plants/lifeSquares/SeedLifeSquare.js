
import { PlantLifeSquare } from "./PlantLifeSquare.js";
class SeedLifeSquare extends PlantLifeSquare {
    constructor(organism, posX, posY) {
        super(organism, posX, posY);
        this.height = 0.25;
        this.opacity = 0.3;
        this.width = 0.25;
    }

    setFrameCartesians() {
        this.ls = this.linkedOrganism.linkedSquare; // "linkedSq"
        this.posVec = [this.ls.posX, this.ls.posY, this.ls.z];
        this.rotVec = [0, 0, 0];
        super.setFrameCartesians();
    }

}
export {SeedLifeSquare};