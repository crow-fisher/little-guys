import { ALL_ORGANISMS } from "../globals.js";
import { getObjectArrFromMap } from "../common.js";
import { removeItemAll } from "../common.js";

function addNewOrganism(organism) {
    if (getOrganismsAtSquare(organism.posX, organism.posY, true).length > 0) {
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
    getObjectArrFromMap(ALL_ORGANISMS, organism.posX, organism.posY, true).push(organism);
    return organism;
}

function getOrganismsAtSquare(posX, posY, create=false) {
    return getObjectArrFromMap(ALL_ORGANISMS, posX, posY, create);
}

function iterateOnOrganisms(func) {
    let rootKeys = Object.keys(ALL_ORGANISMS);
    for (let i = 0; i < rootKeys.length; i++) {
        let subKeys = Object.keys(ALL_ORGANISMS[rootKeys[i]]);
        for (let j = 0; j < subKeys.length; j++) {
            getOrganismsAtSquare(rootKeys[i], subKeys[j]).forEach(func);
        }
    }
}

function removeOrganism(organism) {
    removeItemAll(getObjectArrFromMap(ALL_ORGANISMS, organism.posX, organism.posY), organism);
}

export {addNewOrganism, addOrganism, getOrganismsAtSquare, iterateOnOrganisms, removeOrganism}