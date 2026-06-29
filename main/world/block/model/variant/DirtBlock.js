import { copyVecValue } from "../../../../util/vector.js";
import { Block } from "../Block.js";

export class DirtBlock extends Block {
    constructor(blockManager, cartesian) {
        super(blockManager, cartesian);
        this.colorBase = [65, 52, 18];
        this.grounded = false;
    }

    update() {
        super.update();
        this.movementTick();
    }

    updatePosition(x, y, z) {
        this.unlinkNeighbors();
    }
}