import { copyVecValue } from "../../../util/vector.js";

export function sphereBrush(_this, p, refCs, type) {
    let len, brushSize = 3;
    let cartesian = structuredClone(refCs.world);
    for (let i = -brushSize; i < brushSize; i++) {
        for (let j = -brushSize; j < brushSize; j++) {
            for (let k = -brushSize; k < brushSize; k++) {
                copyVecValue(refCs.world, cartesian);

                cartesian[0] += i;
                cartesian[1] += j;
                cartesian[2] += k;

                len = ((i ** 2 + j ** 2 + k ** 2) ** 0.5);

                if (len > brushSize || len < (brushSize - 1)) {
                    continue;
                }
                _this.addNewBlock(cartesian, type);
            }
        }
    }
}