import { copyVecValue } from "../../../util/vector.js";

export function pixelBrush(_this, p, refCs, type) {
    _this.addNewBlock(refCs.world, type);
}