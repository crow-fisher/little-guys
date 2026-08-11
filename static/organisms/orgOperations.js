import { getFrameSimulationOrganisms } from "../globalOperations.js";

function iterateOnOrganisms(func) {
    getFrameSimulationOrganisms().forEach(func);
}

export {iterateOnOrganisms}