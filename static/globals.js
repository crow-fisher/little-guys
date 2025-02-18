export var ALL_SQUARES = new Map();
export var ALL_ORGANISMS = new Map();
export var ALL_ORGANISM_SQUARES = new Map();
export var stats = new Map();
export var NUM_GROUPS = 0; 
export var WATERFLOW_TARGET_SQUARES = new Map();
export var WATERFLOW_CANDIDATE_SQUARES = new Set();
export var LIGHT_SOURCES = new Array();
export var global_theta_base = 0;

export function getNextGroupId() {
    NUM_GROUPS += 1;
    return NUM_GROUPS;
}

export function resetWaterflowSquares() {
    WATERFLOW_TARGET_SQUARES = new Map();
    WATERFLOW_CANDIDATE_SQUARES = new Map();
}

export function getGlobalThetaBase() {
    return global_theta_base;
}
