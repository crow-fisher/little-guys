import { copyVecValue } from "../../../../util/vector.js";
import { Block } from "../Block.js";

export class StoneBlock extends Block {
    constructor(blockManager, cartesian) {
        super(blockManager, cartesian);
        this.grounded = true;
        
    }
}