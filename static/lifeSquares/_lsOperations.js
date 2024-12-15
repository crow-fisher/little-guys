function addOrganismSquare(organismSqaure) {
    var validSquareArr = Array.from(getSquares(organismSqaure.posX, organismSqaure.posY).filter((sq) => sq.organic || sq.rootable));
    if (validSquareArr.length == 0) {
        console.warn("Invalid organism square placement; no squares to bind to.")
        return false;
    }
    if (getCountOfOrganismsSquaresOfProtoAtPosition(organismSqaure.posX, organismSqaure.posY, organismSqaure.proto) > 0) {
        console.warn("Invalid organism square placement; already found an organism of this type here.")
        return false;
    }
    getObjectArrFromMap(ALL_ORGANISM_SQUARES, organismSqaure.posX, organismSqaure.posY).push(organismSqaure);
    return organismSqaure;
}

function getOrganismSquaresAtSquare(posX, posY) {
    return getObjectArrFromMap(ALL_ORGANISM_SQUARES, posX, posY);
}

function getOrganismSquaresAtSquareOfProto(posX, posY, proto) {
    return getObjectArrFromMap(ALL_ORGANISM_SQUARES, posX, posY).filter((osq) => osq.proto == proto);
}

function getCountOfOrganismsSquaresOfProtoAtPosition(posX, posY, proto) {
    var existingOrganismSquares = getOrganismSquaresAtSquare(posX, posY);
    var existingOrganismSquaresOfSameProtoArray = Array.from(existingOrganismSquares.filter((org) => org.proto == proto));
    return existingOrganismSquaresOfSameProtoArray.length;
}

function getCountOfOrganismsSquaresOfTypeAtPosition(posX, posY, type) {
    var existingOrganismSquares = getOrganismSquaresAtSquare(posX, posY);
    var existingOrganismSquaresOfSameTypeArray = Array.from(existingOrganismSquares.filter((org) => org.type == type));
    return existingOrganismSquaresOfSameTypeArray.length;
}

export { addOrganismSquare, getOrganismSquaresAtSquare, getOrganismSquaresAtSquareOfProto, getCountOfOrganismsSquaresOfProtoAtPosition, getCountOfOrganismsSquaresOfTypeAtPosition}