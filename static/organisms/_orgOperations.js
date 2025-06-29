import { ALL_ORGANISMS } from "../globals.js";
import { getObjectArrFromMap } from "../common.js";
import { removeItemAll } from "../common.js";
import { getFrameSimulationOrganisms, getFrameSimulationSquares } from "../globalOperations.js";

function iterateOnOrganisms(func) {
    getFrameSimulationOrganisms().forEach(func);
}

export {iterateOnOrganisms}