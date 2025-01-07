import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
import { getCurTime } from "../time.js";
import { MossCoolGreenLifeSquare } from "../lifeSquares/MossCoolGreenLifeSquare.js";
import { MossOrganism } from "./MossOrganism.js";

class MossCoolOrganism extends MossOrganism {
    constructor(square) {
        super(square);
        this.proto = "MossCoolOrganism";
        this.waterCoef = 0.4;
    }

    growInitialSquares() {
        var firstMossSquare = addOrganismSquare(new MossCoolGreenLifeSquare(this.linkedSquare, this));
        firstMossSquare.linkSquare(this.linkedSquare);
        this.linkedSquare.linkOrganismSquare(firstMossSquare);
        this.addAssociatedLifeSquare(firstMossSquare);
    }

    growNewGreenAtSquare(square) {
        if (this.recentSquareRemovals.some((pos) => pos[0] == square.posX && pos[1] == square.posY)) {
            return 0;
        }
        var newMossSquare = addOrganismSquare(new MossCoolGreenLifeSquare(square, this));
        newMossSquare.linkSquare(square);
        square.linkOrganismSquare(newMossSquare);
        this.addAssociatedLifeSquare(newMossSquare);
        this.plantLastGrown = getCurTime();
        return newMossSquare.getCost();
    }
}

export { MossCoolOrganism }