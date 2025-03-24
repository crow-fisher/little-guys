import { ALL_ORGANISMS } from "../globals.js";
import { getObjectArrFromMap } from "../common.js";
import { removeItemAll } from "../common.js";

function addNewOrganism(organism) {
    if (getOrganismsAtSquare(organism.posX, organism.posY).length > 0) {
        console.warn("Weird state; tried to add an organism to an existing square.")
        console.log(getOrganismsAtSquare(organism.posX, organism.posY));
        console.log(organism);
        organism.destroy();
        return false;
    }
    if (organism.linkedSquare == null) {
        organism.destroy();
        return false;
    }
    addOrganism(organism);
    return organism;
}

function addOrganism(organism) {
    getObjectArrFromMap(ALL_ORGANISMS, organism.posX, organism.posY).push(organism);
    return organism;
}

function getOrganismsAtSquare(posX, posY) {
    return getObjectArrFromMap(ALL_ORGANISMS, posX, posY);
}

function iterateOnOrganisms(func, sortRandomness) {
    let rootKeys = Object.keys(ALL_ORGANISMS);
    let organismOrder = [];
    for (let i = 0; i < rootKeys.length; i++) {
        let subKeys = Object.keys(ALL_ORGANISMS[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            organismOrder.push(...getOrganismsAtSquare(rootKeys[i], subKeys[j]));
        }
    }
    organismOrder.sort((a, b) => (Math.random() > sortRandomness ? (a.posX + a.posY * 10) - (b.posX + b.posY * 10) : (a.posX + a.posY * 10 - b.posX + b.posY * 10)));
    organismOrder.forEach(func);
}

function removeOrganism(organism) {
    removeItemAll(getObjectArrFromMap(ALL_ORGANISMS, organism.posX, organism.posY), organism);
}

export {addNewOrganism, addOrganism, getOrganismsAtSquare, iterateOnOrganisms, removeOrganism}