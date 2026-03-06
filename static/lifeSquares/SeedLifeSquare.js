
import { BaseLifeSquare } from "./BaseLifeSquare.js";
class SeedLifeSquare extends BaseLifeSquare {
    constructor(organism, posX, posY) {
        super(organism, posX, posY);
        this.height = 0.25;
        this.opacity = 0.3;
        this.width = 0.25;
    }

}
export {SeedLifeSquare};