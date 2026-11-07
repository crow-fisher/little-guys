import { getFrameSimulationOrganisms } from "../globalOperations.js";
import { isSaveOrLoadInProgress } from "../saveAndLoad.js";

function iterateOnOrganisms(func) {
    if (isSaveOrLoadInProgress()) {
        return;
    }
    getFrameSimulationOrganisms().forEach(func);
}

export {iterateOnOrganisms}