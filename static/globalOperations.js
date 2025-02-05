import { getSqIterationOrder, getSquares, iterateOnSquares } from "./squares/_sqOperations.js";
import { getOrganismsAtSquare, iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic, resetWaterflowSquares, LIGHT_SOURCES
} from "./globals.js";

import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getObjectArrFromMap, getStandardDeviation } from "./common.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { removeItemAll } from "./common.js";
import { removeOrganism } from "./organisms/_orgOperations.js";
import { lightingClearLifeSquarePositionMap, lightingPrepareTerrainSquares, lightingRegisterLifeSquare } from "./lighting.js";

export var nextLightingUpdate = 0;
export var default_light_throttle_interval = 30 * 1000;

export function reduceNextLightUpdateTime(amount) {
    nextLightingUpdate -= amount;
}


function doLightSourceRaycasting() {
    var shouldDoFullSquareUpdate = Date.now() > nextLightingUpdate;
    if (!shouldDoFullSquareUpdate) {
        return;
    }
    lightingPrepareTerrainSquares();
    nextLightingUpdate = Date.now() + default_light_throttle_interval;
    iterateOnOrganisms((org) => org.lifeSquares.forEach((lsq) => lightingRegisterLifeSquare(lsq)));
    for (let i = 0; i < LIGHT_SOURCES.length; i++) {
        LIGHT_SOURCES[i].doRayCasting(i);
    }
}

var frame_squares = null;
var frame_organic_squares = null;
var frame_inorganic_squares = null;
var frame_solid_squares = null;
var frame_water_squares = null;
var frame_physics_squares = null;
var frame_soil_physics_squares = null;

function purge() {
    iterateOnSquares((sq) => {
        var ret = true;
        ret &= sq.posX >= 0;
        ret &= sq.posX < CANVAS_SQUARES_X;
        ret &= sq.posY >= 0;
        ret &= sq.posY < CANVAS_SQUARES_Y;
        ret &= sq.blockHealth > 0;
        if (!ret) {
            removeSquare(sq);
        }
    });

    iterateOnOrganisms((org) => {
        var ret = true;
        ret &= org.posX >= 0;
        ret &= org.posX < CANVAS_SQUARES_X;
        ret &= org.posY >= 0;
        ret &= org.posY < CANVAS_SQUARES_Y;
        if (!ret) {
            org.destroy();
        }
    })

    Object.keys(ALL_ORGANISM_SQUARES).forEach((key) => {
        if (key < 0 || key >= CANVAS_SQUARES_X) {
            ALL_ORGANISM_SQUARES.delete(key);
        }
    })
}
function getSquareStdevForGetter(valueGetter, valueGetterName) {
    if (valueGetterName in stats && stats[valueGetterName] != 0) {
        return stats[valueGetterName];
    } else {
        var all_squares = [];
        iterateOnSquares((sq) => all_squares.push(sq), 0);
        var stdev = getStandardDeviation(all_squares.map(valueGetter));
        stats[valueGetterName] = stdev;
        return stdev;
    }
}

function reset() {
    iterateOnSquares((sq) => sq.reset(), 0);
    resetWaterflowSquares();
    lightingClearLifeSquarePositionMap();
    frame_squares = getSqIterationOrder();
    frame_solid_squares = frame_squares.filter((sq) => sq.solid && !sq.organic);
    frame_water_squares = frame_squares.filter((sq) => !sq.solid);
}

function renderSquares() {
    frame_solid_squares.forEach((sq) => sq.render());
}

function renderWater() {
    frame_water_squares.forEach((sq) => sq.render());
}

function physics() {
    frame_squares.forEach((sq) => sq.physicsBefore());
    frame_squares.forEach((sq) => sq.physics());
}

function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

function removeSquare(square) {
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}


function doWaterFlow() {
    let candidateTargetKeys = Array.from(Object.keys(WATERFLOW_TARGET_SQUARES));

    candidateTargetKeys.filter((group) => group in WATERFLOW_CANDIDATE_SQUARES).forEach((targetGroup) => {
        let candidateGroupMap = WATERFLOW_CANDIDATE_SQUARES[targetGroup];
        let targetGroupMap = WATERFLOW_TARGET_SQUARES[targetGroup];

        let candidatePressureKeys = Array.from(Object.keys(candidateGroupMap)).sort((a, b) => a - b);
        let targetPressureKeys = Array.from(Object.keys(targetGroupMap)).sort((a, b) => b - a);

        let candidateOffset = 0;
        let i = 0;

        while (true) {
            let currentTarget = targetPressureKeys[i];
            let currentCandidate = candidatePressureKeys[i + candidateOffset];
            
            if (currentCandidate < currentTarget) {
                // pair off
                var targetIdx = 0;
                var targetArr = targetGroupMap[currentTarget];

                candidateGroupMap[currentCandidate].forEach((sq) => {
                    if (targetIdx >= targetArr.length) {
                        return;
                    } else {
                        let targetPos = targetArr[targetIdx];
                        sq.updatePosition(targetPos[0], targetPos[1])
                        targetIdx += 1;
                    }
                })
                i += 1;
                candidateOffset += 1;
            } else {
                candidateOffset += 1;
            }
            if (i >= candidatePressureKeys.length || (i + candidateOffset) >= targetPressureKeys.length) {
                break;
            }
        }
    });
}


export { purge, reset, renderWater, renderSquares, physics, processOrganisms, renderOrganisms, doWaterFlow, removeSquare, getSquareStdevForGetter, doLightSourceRaycasting }