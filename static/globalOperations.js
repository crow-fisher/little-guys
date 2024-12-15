function purge() {
    iterateOnSquares((sq) => {
        var ret = true;
        ret &= sq.posX >= 0;
        ret &= sq.posX < CANVAS_SQUARES_X;
        ret &= sq.posY >= 0;
        ret &= sq.posY < CANVAS_SQUARES_Y;
        ret &= sq.blockHealth > 0;
        if (!ret) {
            removeSquareAndChildren(sq);
        }
    });

    iterateOnOrganisms((org) => {
        var ret = true;
        ret &= org.posX > 0;
        ret &= org.posX < CANVAS_SQUARES_X;
        ret &= org.posY > 0;
        ret &= org.posY < CANVAS_SQUARES_Y;
        if (!ret) {
            removeOrganism(org);
        }
    })

    ALL_ORGANISM_SQUARES.keys().forEach((key) => {
        if (key < 0 || key >= CANVAS_SQUARES_X) {
            ALL_ORGANISM_SQUARES.delete(key);
        }
    })
}


function reset() {
    iterateOnSquares((sq) => sq.reset(), 0);
    stats["pressure"] = 0;
    WATERFLOW_TARGET_SQUARES = new Map();
    WATERFLOW_CANDIDATE_SQUARES = new Set();
}

function render() {
    iterateOnSquares((sq) => sq.render(), 0);
}
function physics() {
    iterateOnSquares((sq) => sq.physics(), 0.5);
}
function physicsBefore() {
    iterateOnSquares((sq) => sq.physicsBefore(), 0);
    iterateOnSquares((sq) => sq.physicsBefore2(), 0);
}

function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

function removeSquareAndChildren(square) {
    if (square.collision) {
        getObjectArrFromMap(ALL_ORGANISMS, square.posX, square.posY).forEach((org) => org.destroy());
        getOrganismSquaresAtSquare(square.posX, square.posY)
            .forEach((orgSq) => removeItemAll(getObjectArrFromMap(ALL_ORGANISM_SQUARES, square.posX, square.posY), orgSq));
    }
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}

export {purge, reset, render, physics, physicsBefore, processOrganisms, renderOrganisms}