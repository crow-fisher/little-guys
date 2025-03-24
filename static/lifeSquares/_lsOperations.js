import { getObjectArrFromMap } from "../common.js";
import { ALL_ORGANISM_SQUARES } from "../globals.js";
import { getSquares } from "../squares/_sqOperations.js";

function addOrganismSquare(organismSqaure) {
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
    let existingOrganismSquares = getOrganismSquaresAtSquare(posX, posY);
    let existingOrganismSquaresOfSameProtoArray = Array.from(existingOrganismSquares.filter((org) => org.proto == proto));
    return existingOrganismSquaresOfSameProtoArray.length;
}

function getCountOfOrganismsSquaresOfTypeAtPosition(posX, posY, type) {
    let existingOrganismSquares = getOrganismSquaresAtSquare(posX, posY);
    let existingOrganismSquaresOfSameTypeArray = Array.from(existingOrganismSquares.filter((org) => org.type == type));
    return existingOrganismSquaresOfSameTypeArray.length;
}

function getOrganismSquaresAtSquareWithEntityId(sq, spawnedEntityId) {
    return Array.from(getOrganismSquaresAtSquare(sq.posX, sq.posY).filter((ls) => ls.spawnedEntityId == spawnedEntityId));
}

export { 
    addOrganismSquare, getOrganismSquaresAtSquare, getOrganismSquaresAtSquareOfProto, 
    getCountOfOrganismsSquaresOfProtoAtPosition, getCountOfOrganismsSquaresOfTypeAtPosition, 
    getOrganismSquaresAtSquareWithEntityId
}