import { BaseSquare } from "./BaseSqaure.js";
    
import { randRange } from "../common.js";
class SeedSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SeedSquare";
        
        this.baseColor = "#0088FF";
        this.darkColor = "#00001D";
        this.accentColor = "#FF6A00";

        this.rootable = true;
        this.organic = true;
        this.visible = false;
        this.rockable = false;
        this.gravity = randRange(4, 8);
    }
    gravityPhysics() {
        super.gravityPhysics();
        if (this.linkedOrganisms.length == 0) {
            this.destroy();
            return;
        }
    }
}

export {SeedSquare}