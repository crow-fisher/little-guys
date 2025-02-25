export var ALL_SQUARES = new Map();
export var ALL_ORGANISMS = new Map();
export var ALL_ORGANISM_SQUARES = new Map();
export var stats = new Map();
export var NUM_GROUPS = 0; 
export var WATERFLOW_TARGET_SQUARES = new Map();
export var WATERFLOW_CANDIDATE_SQUARES = new Set();
export var LIGHT_SOURCES = new Array();
export var global_theta_base = 0;

let mixArrLen = 3; 
let curMixIdx = Math.floor(Date.now());
curMixIdx -= curMixIdx % mixArrLen;
let targetMixIdx = curMixIdx + mixArrLen;
let mixArr = new Array(mixArrLen);

export function getCurMixIdx() {
    return curMixIdx;
}
export function setCurMixIdx(inVal) {
    curMixIdx = inVal;
}
export function getTargetMixIdx() {
    return targetMixIdx;
}
export function setTargetMixIdx(inVal) {
    targetMixIdx = inVal;
}
export function getMixArrLen() {
    return mixArrLen;
}
export function getMixArr() {
    return mixArr;
}

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

export function setGlobalThetaBase(inVal) {
    global_theta_base = inVal;
}