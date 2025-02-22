import { getObjectArrFromMap } from "../common.js";
import { ALL_SQUARES, ALL_ORGANISM_SQUARES } from "../globals.js";
import { removeSquare } from "../globalOperations.js";
import { removeItemAll } from "../common.js";
import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
import { getCanvasSquaresX, getCanvasSquaresY } from "../canvas.js";

var abs = Math.abs;
let dir = -1;

function* getNeighbors(x, y) {
    dir *= -1;
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            if (abs(i) == abs(j)) {
                continue;
            }
            
            var squares = getSquares(x + (i * dir), y + (j * dir));
            for (let i = 0; i < squares.length; i++) {
                yield squares[i];
            };
        }
    }
}


function addSquare(square) {
    if (!square.organic && square.collision && getSquares(square.posX, square.posY).some((sq) => sq.collision)) {
        return false;
    }
    if (!square.organic && getSquares(square.posX, square.posY).some((sq) => sq.proto == square.proto)) {
        return false;
    }
    getSquares(square.posX, square.posY).push(square);
    return square;
}

function addSquareOverride(square) {
    var existingSquares = getSquares(square.posX, square.posY);
    if (Array.from(existingSquares.filter((sq) => sq.collision)).length == 0) {
        addSquare(square);
        return;
    }
    var bottomLayer = Array.from(existingSquares.filter((sq) => sq.collision && sq.posY == (getCanvasSquaresY() - 1)));
    if (bottomLayer.length > 0) {
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
    var rootKeys = Object.keys(ALL_SQUARES);
    var squareOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_SQUARES[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            squareOrder.push(...getSquares(rootKeys[i], subKeys[j]));
        }
    }
    let cmp = (sq) => (frameOrder[sq.posX] + sq.posY * getCanvasSquaresX())
    squareOrder.sort((b, a) => cmp(a) - cmp(b));
    // squareOrder.sort((b, a) => (a.posX + a.posY * getCanvasSquaresX()) - (b.posX + b.posY * getCanvasSquaresX()));

    return squareOrder;
}
/**
 * @param {function} func - function with an argumnet of the square it should do the operation on  
 */
function iterateOnSquares(func) {
    var rootKeys = Object.keys(ALL_SQUARES);
    var squareOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_SQUARES[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            squareOrder.push(...getSquares(rootKeys[i], subKeys[j]));
        }
    }
    squareOrder.sort((b, a) => (a.posX + a.posY * getCanvasSquaresX()) - (b.posX + b.posY * getCanvasSquaresX()));
    squareOrder.forEach(func);
}


function getSquares(posX, posY) {
    return getObjectArrFromMap(ALL_SQUARES, Math.floor(posX), Math.floor(posY));
}

function getCollidableSquareAtLocation(posX, posY) {
    return getSquares(posX, posY).filter((sq) => sq.collision);
}

function removeOrganismSquare(organismSquare) {
    removeItemAll(getObjectArrFromMap(ALL_ORGANISM_SQUARES, organismSquare.posX, organismSquare.posY), organismSquare);
}

// Does not remove organic squares.
function removeSquarePos(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    getOrganismsAtSquare(x, y).forEach((org) => org.destroy());
    getSquares(x, y).filter((sq) => !sq.organic).forEach((sq) => sq.destroy());
}


export {getSqIterationOrder, getNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, removeOrganismSquare, removeSquarePos};
