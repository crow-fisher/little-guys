import { getObjectArrFromMap } from "../common.js";
import { ALL_SQUARES, ALL_ORGANISM_SQUARES, stats } from "../globals.js";
import { removeSquare } from "../globalOperations.js";
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";
import { removeItemAll } from "../common.js";
import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";

var abs = Math.abs;

function getNeighbors(x, y) {
    var out = [];
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            out.push(...getSquares(x + i, y + j));
        }
    }
    return out;
}

function getDirectNeighbors(x, y) {
    var out = [];
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue;
            }
            if (abs(i) == abs(j)) {
                continue;
            }
            out.push(...getSquares(x + i, y + j));
        }
    }
    return out;
}

function addSquare(square) {
    if (square.collision && getSquares(square.posX, square.posY).some((sq) => sq.collision)) {
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
    var existingStaticSquareArrPhysicsDisabled = Array.from(existingSquares.filter((sq) => sq.collision && !sq.physicsEnabled));
    if (existingStaticSquareArrPhysicsDisabled.length > 0) {
        return;
    }
    if (square.collision) {
        existingSquares.filter((sq) => sq.collision).forEach((sq) => removeSquare(sq));
    }
    addSquare(square);
}

/**
 * @param {function} func - function with an argumnet of the square it should do the operation on  
 */
function iterateOnSquares(func, sortRandomness) {
    var rootKeys = Object.keys(ALL_SQUARES);
    var squareOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_SQUARES[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            squareOrder.push(...getSquares(rootKeys[i], subKeys[j]));
        }
    }
    squareOrder.sort((a, b) => (Math.random() > sortRandomness ? (a.posX + a.posY * 10) - (b.posX + b.posY * 10) : (a.posX + a.posY * 10 - b.posX + b.posY * 10)));
    squareOrder.forEach(func);
}


function getSquares(posX, posY) {
    return getObjectArrFromMap(ALL_SQUARES, posX, posY);
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




export {getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, removeOrganismSquare, removeSquarePos};
