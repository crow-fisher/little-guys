import { ALL_ORGANISMS, curEntitySpawnedId, getNextEntitySpawnId } from "../globals.js";
import { getObjectArrFromMap } from "../common.js";
import { getCollidableSquareAtLocation } from "../squares/_sqOperations.js";
import { removeItemAll } from "../common.js";

function addOrganism(organism) {
    if (Array.from(getCollidableSquareAtLocation(organism.posX, organism.posY)).length == 0) {
        console.warn("Invalid organism placement; no collidable squares to bind to.")
        return false;
    }

    if (getOrganismsAtSquare(organism.posX, organism.posY).length > 0) {
        organism.destroy();
        return false;
    }

    if (organism.associatedSquares.length > 0) {
        organism.spawnedEntityId = getNextEntitySpawnId();
        organism.associatedSquares.forEach((asq) => asq.setSpawnedEntityId(organism.spawnedEntityId));
        getObjectArrFromMap(ALL_ORGANISMS, organism.posX, organism.posY).push(organism);
        return organism;
    } else {
        console.log("Organism is fucked up in some way; please reconsider")
        organism.destroy();
        return false;
    }
}

function getOrganismsAtSquare(posX, posY) {
    return getObjectArrFromMap(ALL_ORGANISMS, posX, posY);
}

function iterateOnOrganisms(func, sortRandomness) {
    var rootKeys = Object.keys(ALL_ORGANISMS);
    var organismOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        var subKeys = Object.keys(ALL_ORGANISMS[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            organismOrder.push(...getOrganismsAtSquare(rootKeys[i], subKeys[j]));
        }
    }
    organismOrder.sort((a, b) => (Math.random() > sortRandomness ? (a.posX + a.posY * 10) - (b.posX + b.posY * 10) : (a.posX + a.posY * 10 - b.posX + b.posY * 10)));
    organismOrder.forEach(func);
}

function removeOrganism(organism) {
    var posX = organism.posX;
    var posY = organism.posY;
    removeItemAll(getObjectArrFromMap(ALL_ORGANISMS, posX, posY), organism);
}

export {addOrganism, getOrganismsAtSquare, iterateOnOrganisms, removeOrganism}