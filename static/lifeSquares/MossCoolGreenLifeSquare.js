
import { MossGreenLifeSquare } from "./MossGreenLifeSquare.js";
class MossCoolGreenLifeSquare extends MossGreenLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "MossCoolGreenLifeSquare";
        this.type = "green";

        this.baseColor = "#a2d321";
        this.darkColor = "#8dc320";
        this.accentColor = "#5aa100";
    }
}

export { MossCoolGreenLifeSquare }