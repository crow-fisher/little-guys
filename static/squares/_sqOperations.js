import { getObjectArrFromMap } from "../common.js";
import { ALL_SQUARES, ALL_ORGANISM_SQUARES } from "../globals.js";
import { removeSquare } from "../globalOperations.js";
import { removeItemAll } from "../common.js";
import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { getCanvasSquaresX, getCanvasSquaresY } from "../canvas.js";

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


function addSquare(square) {
    // if (getSquares(square.posX, square.posY).some((sq) => sq.testCollidesWithSquare(square))) {
    //     return false;
    // }
    if (!square.organic && square.collision && getSquares(square.posX, square.posY).some((sq) => sq.testCollidesWithSquare(square))) {
        return false;
    }
    getSquares(square.posX, square.posY, true).push(square);
    return square;
}

function addSquareOverride(square) {
    let existingSquares = getSquares(square.posX, square.posY);
    if (Array.from(existingSquares.filter((sq) => sq.collision)).length == 0) {
        addSquare(square);
        return;
    }
    if (square.collision) {
        existingSquares.filter((sq) => sq.collision).forEach((sq) => removeSquare(sq));
    }
    addSquare(square);
    return square;
}

function getFrameIterationOrder() {
    let out = [];
    let order = [];
    for (let i = 0; i < getCanvasSquaresX(); i++) {
        out.push(i);
        order.push(Math.random());
    }

    out.sort((a, b) => order[a] - order[b]);
    return out;
}

let frameOrder = getFrameIterationOrder();


function getSqIterationOrder() {
    if (frameOrder.length != getCanvasSquaresX()) {
        frameOrder = getFrameIterationOrder();
    }
    let squareOrder = [];
    for (let i = 0; i < getCanvasSquaresX(); i++) {
        for (let j = 0; j < getCanvasSquaresY(); j++) {
            squareOrder.push(...getSquares(i, j))
        }
    }
    let cmp = (sq) => ((sq.solid ? frameOrder[sq.posX] : sq.posX) + sq.posY * getCanvasSquaresX())
    squareOrder.sort((b, a) => cmp(a) - cmp(b));
    return squareOrder;
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

function getCollidableSquareAtLocation(posX, posY) {
    return getSquares(posX, posY).filter((sq) => sq.collision);
}

// Does not remove organic squares.
function removeSquarePos(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    getOrganismsAtSquare(x, y).forEach((org) => org.destroy());
    getSquares(x, y).filter((sq) => !sq.organic).forEach((sq) => sq.destroy());
}


export {getSqIterationOrder, getNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, removeSquarePos};
