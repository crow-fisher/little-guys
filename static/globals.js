var ALL_SQUARES = new Map();
var ALL_ORGANISMS = new Map();
var ALL_ORGANISM_SQUARES = new Map();
var stats = new Map();
var NUM_GROUPS = 0; 
var WATERFLOW_TARGET_SQUARES = new Map();
var WATERFLOW_CANDIDATE_SQUARES = new Set();



function getNextGroupId() {
    NUM_GROUPS += 1;
    return NUM_GROUPS;
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


export {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic
}