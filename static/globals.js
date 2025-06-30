import { loadSlot, saveCurGame } from "./saveAndLoad.js";
import { iterateOnSquares } from "./squares/_sqOperations.js";
import { removeGroupFromGraph } from "./waterGraph.js";

export let ALL_SQUARES = new Map();
export let stats = new Map();
export let NUM_GROUPS = 0; 
export let WATERFLOW_TARGET_SQUARES = new Map();
export let WATERFLOW_CANDIDATE_SQUARES = new Map();
export let LIGHT_SOURCES = new Array();
export let global_theta_base = 0;

export function purgeMaps() {
    ALL_SQUARES = new Map();
}

let mixArrLen = 3; 
let curMixIdx = Math.floor(Date.now());
curMixIdx -= curMixIdx % mixArrLen;
let targetMixIdx = curMixIdx + mixArrLen;
let mixArr = new Array(mixArrLen);
let groundedMap = new Map();

let groupSizeListSize = 100000;
let groupSizeList = new Array(groupSizeListSize);

export function initGroupList() {
    for (let i = 0; i < groupSizeListSize; i++) {
        groupSizeList[i] = 0;
    }
}

export function regSquareToGroup(group, reg=1) {
    if (group < 0) {
        return;
    }
    if (group == (groupSizeListSize + 1)) {
        initGroupList();
    }
    groupSizeList[group % groupSizeListSize] += reg;

    if (groupSizeList[group % groupSizeListSize] == 0) {
        removeGroupFromGraph(group);
    }
}

export function getGroupSize(group) {
    return groupSizeList[group % groupSizeListSize];
}

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

export function isGroupGrounded(group) {
    return groundedMap.get(group);
}
export function setGroupGrounded(group, value=true) {
    groundedMap.set(group, value);
}

export function resetWaterflowSquares() {
    WATERFLOW_TARGET_SQUARES.clear();
    WATERFLOW_CANDIDATE_SQUARES.clear();
}

export function getGlobalThetaBase() {
    return global_theta_base;
}

export function setGlobalThetaBase(inVal) {
    global_theta_base = inVal;
}