import { copyVecValue } from "../../../../util/vector.js";
import { Block } from "../Block.js";

export class ColorBlock extends Block {
    constructor(blockManager, cartesian) {
        super(blockManager, cartesian);
        this.colorConfig = this.blockManager.worldManager.mainManager.uiManager.colorConfig;
        this.colorBase = structuredClone(this.colorConfig.rgbArr);
        this.grounded = true;
        
    }
}