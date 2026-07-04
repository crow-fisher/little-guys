import { copyVecValue } from "../../../../util/vector.js";
import { Block } from "../Block.js";

export class DirtBlock extends Block {
    constructor(blockManager, cartesian) {
        super(blockManager, cartesian);
        this.colorBase = [65, 52, 18];
        this.colorBase = [169, 98, 187];
        this.grounded = false;
        
    }
}