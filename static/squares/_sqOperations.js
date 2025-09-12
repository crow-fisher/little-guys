import { getFirstLevelObjectMapFromMap, getObjectArrFromMap } from "../common.js";
import { ALL_SQUARES } from "../globals.js";
import { removeSquare } from "../globalOperations.js";
import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_SURFACE } from "../ui/UIData.js";
import { isSquareOnCanvas } from "../canvas.js";

let abs = Math.abs;
let dir = -1;

function* getNeighbors(x, y) {
    dir *= -1;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            if (abs(i) == abs(j)) {
                continue;
            }
            
            let squares = getSquares(x + (i * dir), y + (j * dir));
            for (let i = 0; i < squares.length; i++) {
                yield squares[i];
            };
        }
    }
}


function addSquare(sq) {
    if (!isSquareOnCanvas(sq.posX, sq.posY) && sq.proto == "SeedSquare")
        return false;

    if (getSquares(sq.posX, sq.posY).some((ssq) => ssq.testCollidesWithSquare(sq))) {
        return false;
    }
    getSquares(sq.posX, sq.posY, true).push(sq);
    if ((sq.proto != "PlantSquare")) {
        registerSqIterationRowChange(sq.posY);
        registerSqColChange(sq.posX, sq.posY);
    }
    return sq;
}

function addSquareOverride(square) {
    let existingSquares = getSquares(square.posX, square.posY);
    if (Array.from(existingSquares.filter((sq) => sq.collision)).length == 0) {
        addSquare(square);
        return;
    }
    let prevSurfaceLightingFactor = loadGD(UI_LIGHTING_SURFACE);
    if (square.collision) {
        existingSquares.filter((sq) => sq.collision).forEach((sq) => {
            prevSurfaceLightingFactor = sq.surfaceLightingFactor; 
            removeSquare(sq)
        });
    }
    addSquare(square); 
    square.surfaceLightingFactor = prevSurfaceLightingFactor;
    return square;
}

function getFrameIterationOrder() {
    let out = [];
    let order = [];
    for (let i = 0; i < loadGD(UI_GAME_MAX_CANVAS_SQUARES_X); i++) {
        out.push(i);
        order.push(Math.random());
    }

    out.sort((a, b) => order[a] - order[b]);
    return out;
}

let frameOrder = getFrameIterationOrder();

const sqIterationOrderMap = new Map();
const sqIterationOrderChangeMap = new Map();

function sqOrderCmp(sq) {
    if (frameOrder.length != loadGD(UI_GAME_MAX_CANVAS_SQUARES_X)) {
        frameOrder = getFrameIterationOrder();
    }
    return ((sq.solid ? frameOrder[sq.posX] : sq.posX) + sq.posY * loadGD(UI_GAME_MAX_CANVAS_SQUARES_X));
}

export function registerSqIterationRowChange(y) {
    y = Math.floor(y);
    sqIterationOrderChangeMap.set(y, true);
}

function processSqIterationOrderChanges() {
    for (let y = 0; y < loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y); y++) {
        if (sqIterationOrderChangeMap.get(y)) {
            sqIterationRowChange(y);
            sqIterationOrderChangeMap.set(y, false);
        }
    }
}

export function isSqRowChanged(y) {
    return sqIterationOrderChangeMap.get(y);
}

function sqIterationRowChange(y) {
    sqIterationOrderMap.set(y, new Array());
    for (let i = 0; i < loadGD(UI_GAME_MAX_CANVAS_SQUARES_X); i++) {
        sqIterationOrderMap.get(y).push(...getSquares(i, y));
    }
    sqIterationOrderMap.get(y).sort((b, a) => sqOrderCmp(a) - sqOrderCmp(b));
}

export function* getSqIterationOrder() {
    processSqIterationOrderChanges();
    for (let y = loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y); y >= 0; y--) {
        if (sqIterationOrderMap.has(y)) {
            let arr = sqIterationOrderMap.get(y);
            for (let i = 0; i < arr.length; i++) {
                yield arr[i];
            }
        }
    }
}

const sqColChangeMap = new Map();
const sqColChangeLocationMap = new Map();

export function isSqColChanged(x) {
    return sqColChangeMap.get(x) > 0;
}

export function registerSqColChange(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (!sqColChangeMap.has(x)) {
        sqColChangeMap.set(x, 0);
        sqColChangeLocationMap.set(x, 0);
    }
    sqColChangeMap.set(x,  Math.min(10, sqColChangeMap.get(x) + 1));
    sqColChangeLocationMap.set(x, Math.max(sqColChangeLocationMap.get(y)));
}


export function resetSqColChangeMap() {
    sqColChangeMap.keys().forEach((key) => sqColChangeMap.set(key, Math.max(0, sqColChangeMap.get(key) - 1)));
    sqColChangeLocationMap.keys().forEach((key) => sqColChangeLocationMap.set(key, 0));
}

export function getSqColChangeLocation(posX) {
    posX = Math.floor(posX);
    if (!sqColChangeLocationMap.has(posX)) {
        sqColChangeLocationMap.set(posX, 0);
    }
    return sqColChangeLocationMap.get(posX);
}
/**
 * @param {function} func - applies provided function to all squares
 */
function iterateOnSquares(func) {
    ALL_SQUARES.keys().forEach((key) => ALL_SQUARES.get(key).keys().forEach((subkey) => ALL_SQUARES.get(key).get(subkey).forEach((func))));
}


function getSquares(posX, posY, create=false) {
    return getObjectArrFromMap(ALL_SQUARES, Math.floor(posX), Math.floor(posY), create);
}

export function getFirstLevelSquares(posX) {
    return getFirstLevelObjectMapFromMap(ALL_SQUARES, posX);
}

function getCollidableSquareAtLocation(posX, posY) {
    return getSquares(posX, posY).filter((sq) => sq.collision);
}

// Does not remove organic squares.
function removeSquarePos(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    getSquares(x, y).filter((sq) => !sq.organic).forEach((sq) => sq.destroy(true));
}


export {getNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, removeSquarePos};
