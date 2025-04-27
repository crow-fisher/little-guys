import { iterateOnSquares } from "./squares/_sqOperations.js";
import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X } from "./ui/UIData.js";

let groupMap = new Map();
let frameGroupCache = new Map();

let squaresX = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X);

function _hash(posX, posY) {
    return posX + posY * squaresX; 
}

export function waterGraphReset() {
    groupMap.clear();
    squaresX = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X);
    iterateOnSquares((sq) => registerSquare(sq.posX, sq.posY, sq.group));
}

export function registerSquare(posX, posY, group) {
    if (!groupMap.has(group))
        groupMap.set(group, new Set());
    groupMap.get(group).add(_hash(posX, posY));
}
export function deregisterSquare(posX, posY, group) {
    if (groupMap.has(group))
        groupMap.get(group).delete(_hash(posX, posY));
}

export function removeGroupFromGraph(group) {
    groupMap.delete(group);
}

export function resetFrameGroupCache() {
    frameGroupCache.clear();
}

export function isGroupContiguous(group) {
    if (frameGroupCache.has(group))
        return frameGroupCache.get(group);

    frameGroupCache.set(group, _isGroupContiguous(group));
    return frameGroupCache.get(group);
}

export function _isGroupContiguous(group) {
    let xWidth = loadGD(UI_GAME_MAX_CANVAS_SQUARES_X);
    let groupSquares = groupMap.get(group);

    if (groupSquares.size < 5 ) {
        return true;
    }
    if (groupSquares == null) {
        return true; // (theoretically) unreachable 
    }

    let posMap = Array.from(groupSquares.values()).sort();

    let c1, c2;
    for (let i = 0; i < posMap.length - 1; i++) {
        c1 = posMap[i];
        c2 = posMap[i + 1];
        let diff = (c2 - c1);
        if (diff != 1 && diff != xWidth)
            continue; 
        return false;
    }
    return true;
}