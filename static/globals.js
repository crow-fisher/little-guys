var ALL_SQUARES = new Map();
var ALL_ORGANISMS = new Map();
var ALL_ORGANISM_SQUARES = new Map();
var stats = new Map();
var NUM_GROUPS = 0; 
var WATERFLOW_TARGET_SQUARES = new Map();
var WATERFLOW_CANDIDATE_SQUARES = new Set();
var curEntitySpawnedId = 0;
var curTime = 0;
var prevTime = Date.now();
var darkeningColorCache = new Map();


function getCurTime() {
    return curTime;
}

function updateTime() {
    var dt = Date.now() - prevTime;
    if (dt > 100) {
        prevTime = Date.now();
    } else {
        curTime += dt; 
        prevTime = Date.now();
    }
}

function getNextGroupId() {
    NUM_GROUPS += 1;
    return NUM_GROUPS;
}

function getCurEntitySpawnId() {
    return curEntitySpawnedId;
}

function getNextEntitySpawnId() {
    curEntitySpawnedId += 1;
    return curEntitySpawnedId;
}

function updateGlobalStatistic(name, value) {
    if (name in stats) {
        if (value > (stats[name])) {
            stats[name] = value;
        }
    }
}
function getGlobalStatistic(name) {
    if (!name in stats) {
        console.warn("getGlobalStatistic miss for ", name)
        return -1;
    }
    return stats[name];
}

function resetWaterflowSquares() {
    WATERFLOW_TARGET_SQUARES = new Map();
    WATERFLOW_CANDIDATE_SQUARES = new Set();
}
export {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, curEntitySpawnedId, darkeningColorCache,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic,
    getNextEntitySpawnId, getCurEntitySpawnId, resetWaterflowSquares,
    getCurTime, updateTime
}