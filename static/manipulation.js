var ERASE_RADIUS = 2;

import { removeSquarePos } from "./squares/_sqOperations.js";

function doErase(x, y) {
    var workingEraseRadius = ERASE_RADIUS * 2 + 1;
    // it has to be an odd number
    // we make a cross like thing
    var start = (workingEraseRadius + 1) / 2;
    for (var i = -start; i < start; i++) {
        for (var j = -start; j < start; j++) {
            if (Math.abs(i) + Math.abs(j) + 2 > (start ** 2 + start ** 2) ** 0.5) {
                continue;
            }
            removeSquarePos(x + i, y + j);
        }
    }
}


export {doErase}
