
import { MossGreenLifeSquare } from "./MossGreenLifeSquare.js";
class MossCoolGreenLifeSquare extends MossGreenLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "MossCoolGreenLifeSquare";
        this.type = "green";

        this.baseColor = "#4DBB58";
        this.darkColor = "#366847";
        this.accentColor = "#78a88b";
    }
}

export { MossCoolGreenLifeSquare }