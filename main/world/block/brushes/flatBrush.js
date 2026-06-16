import { addVec3Mult, addVec3MultDest, addVec3MultFloor, copyVecValue } from "../../../util/vector.js";

export function flatBrush(_this, p, refCs) {
    let size = 2;
    let cur = [0, 0, 0];
    for (let i = -size; i < size; i++) {
        for (let j = 0; j < size; j++) {
            addVec3MultDest(refCs.world, p.right, i, cur);
            addVec3MultFloor(cur, p.up, j);
            _this.addNewBlock(cur);

        }
    }
}