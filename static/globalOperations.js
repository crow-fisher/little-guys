import { getSqIterationOrder, getSquares, iterateOnSquares } from "./squares/_sqOperations.js";
import { getOrganismsAtSquare, iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic, resetWaterflowSquares
} from "./globals.js";

import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getObjectArrFromMap, getStandardDeviation } from "./common.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { removeItemAll } from "./common.js";
import { removeOrganism } from "./organisms/_orgOperations.js";
import { lightingClearLifeSquarePositionMap } from "./lighting.js";

var frame_squares = null;
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
    stats["pressure"] = 0;
    stats["squareStdev"] = 0;
    resetWaterflowSquares();
    lightingClearLifeSquarePositionMap();
    frame_squares = getSqIterationOrder();
    frame_physics_squares = frame_squares.filter((sq) => sq.physicsEnabled || sq.special);
    frame_soil_physics_squares = frame_squares.filter((sq) => sq.soilPhysicsEnabled);
    frame_inorganic_squares = frame_squares.filter((sq) => !sq.organic);
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
    frame_soil_physics_squares.forEach((sq) => sq.soilPhysics());
    frame_physics_squares.forEach((sq) => sq.physics());
}
function physicsBefore() {
    frame_physics_squares.forEach((sq) => sq.physicsBefore());
    frame_physics_squares.forEach((sq) => sq.physicsBefore2());
}

function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

function renderOrganisms() {
    iterateOnOrganisms((org) => org.proto.startsWith("Moss") ? org.render() : null, 0);
    iterateOnOrganisms((org) => !org.proto.startsWith("Moss") ? org.render() : null, 0);
}

function removeSquare(square) {
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}


function doWaterFlow() {
    var movedCandidates = new Set();
    for (let curWaterflowPressure = 0; curWaterflowPressure < getGlobalStatistic("pressure"); curWaterflowPressure++) {
        if (!(curWaterflowPressure in WATERFLOW_TARGET_SQUARES)) {
            continue;
        }
        Array.from(WATERFLOW_CANDIDATE_SQUARES).filter((candidate) => !(candidate in movedCandidates))
            .forEach((candidate) => {
                let curTargetSet = Array.from(WATERFLOW_TARGET_SQUARES[curWaterflowPressure]).filter((arr) => arr[2] == candidate.group);
                curTargetSet.some((target) => {
                    if (Math.random() > ((0.998 - (candidate.viscocity.value * curWaterflowPressure)))) {
                        if (candidate.updatePosition(target[0], target[1])) {
                            movedCandidates.add(candidate);
                            return true;
                        }
                    } return false;
                });
            });
    }
}

export {purge, reset, renderWater, renderSquares, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquare, getSquareStdevForGetter}