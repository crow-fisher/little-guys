import { MossCoolOrganism } from "./MossCoolOrganism.js";
import { MossSeedOrganism } from "./MossSeedOrganism.js";


class MossCoolSeedOrganism extends MossSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "MossCoolSeedOrganism";
        this.sproutCtor = (linkedSquare) => new MossCoolOrganism(linkedSquare)
    }
}

export {MossCoolSeedOrganism} 