
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


export {getNextGroupId, updateGlobalStatistic, getGlobalStatistic}