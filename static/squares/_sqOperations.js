import { getSquares, removeSquare } from "..";

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
    var error = false;
    getCollidableSquareAtLocation(square.posX, square.posY).forEach((sq) => {
        error = true;
    })

    if (error) {
        console.warn("Square not added; coordinates occupied by a block with collision.");
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
        existingStaticSquareArr = existingSquares.filter((sq) => sq.collision).forEach((sq) => removeSquare(sq));
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
    var posX = organismSquare.posX;
    var posY = organismSquare.posY;
    removeItemAll(getObjectArrFromMap(ALL_ORGANISM_SQUARES, posX, posY), organismSquare);
}

function removeSquarePos(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    getSquares(x, y).forEach(removeSquare);
}

function removeSquare(square) {
    if (square.collision) {
        getObjectArrFromMap(ALL_ORGANISMS, square.posX, square.posY).forEach((org) => org.destroy());
        getOrganismSquaresAtSquare(square.posX, square.posY)
            .forEach((orgSq) => removeItemAll(getObjectArrFromMap(ALL_ORGANISM_SQUARES, square.posX, square.posY), orgSq));
    }
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}



export {getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares};
