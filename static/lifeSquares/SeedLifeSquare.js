
import { BaseLifeSquare } from "./BaseLifeSquare.js";
class SeedLifeSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "SeedLifeSquare";
        this.type = "seed";
        this.height = 0.25;

        this.baseColor = "#ecb55a";
        this.darkColor = "#a96831";
        this.accentColor = "#8c6249";
    }

}
export {SeedLifeSquare};