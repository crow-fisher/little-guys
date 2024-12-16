import { iterateOnSquares } from "./squares/_sqOperations.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic, resetWaterflowSquares
} from "./globals.js";

import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getObjectArrFromMap } from "./common.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { removeItemAll } from "./common.js";
import { removeOrganism } from "./organisms/_orgOperations.js";



function purge() {
    iterateOnSquares((sq) => {
        var ret = true;
        ret &= sq.posX >= 0;
        ret &= sq.posX < CANVAS_SQUARES_X;
        ret &= sq.posY >= 0;
        ret &= sq.posY < CANVAS_SQUARES_Y;
        ret &= sq.blockHealth > 0;
        if (!ret) {
            removeSquareAndChildren(sq);
        }
    });

    iterateOnOrganisms((org) => {
        var ret = true;
        ret &= org.posX > 0;
        ret &= org.posX < CANVAS_SQUARES_X;
        ret &= org.posY > 0;
        ret &= org.posY < CANVAS_SQUARES_Y;
        if (!ret) {
            removeOrganism(org);
        }
    })

    ALL_ORGANISM_SQUARES.keys().forEach((key) => {
        if (key < 0 || key >= CANVAS_SQUARES_X) {
            ALL_ORGANISM_SQUARES.delete(key);
        }
    })
}


function reset() {
    iterateOnSquares((sq) => sq.reset(), 0);
    stats["pressure"] = 0;
    resetWaterflowSquares();
}

function render() {
    iterateOnSquares((sq) => sq.render(), 0);
}
function physics() {
    iterateOnSquares((sq) => sq.physics(), 0.5);
}
function physicsBefore() {
    iterateOnSquares((sq) => sq.physicsBefore(), 0);
    iterateOnSquares((sq) => sq.physicsBefore2(), 0);
}

function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

function removeSquareAndChildren(square) {
    if (square.collision) {
        getObjectArrFromMap(ALL_ORGANISMS, square.posX, square.posY)
            .filter((org) => (!square.organic || org.spawnedEntityId == square.spawnedEntityId))
            .forEach((org) => org.destroy());

        getOrganismSquaresAtSquare(square.posX, square.posY)
            .filter((orgSq) => (!square.organic || orgSq.spawnedEntityId == square.spawnedEntityId))
            .forEach((orgSq) => removeItemAll(getObjectArrFromMap(ALL_ORGANISM_SQUARES, square.posX, square.posY), orgSq));
    }
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}


function doWaterFlow() {
    for (let curWaterflowPressure = 0; curWaterflowPressure < getGlobalStatistic("pressure"); curWaterflowPressure++) {
        if (WATERFLOW_CANDIDATE_SQUARES.size > 0) {
            // we need to do some water-mcflowin!
            var candidate_squares_as_list = Array.from(WATERFLOW_CANDIDATE_SQUARES);
            var target_squares = WATERFLOW_TARGET_SQUARES[curWaterflowPressure];
            if (target_squares == null) {
                continue;
            }

            for (let j = 0; j < Math.max(candidate_squares_as_list.length, target_squares.length); j++) {
                var candidate = candidate_squares_as_list[j % candidate_squares_as_list.length];
                var target = target_squares[j % target_squares.length];
                if (candidate.group == target[2]) {
                    if (Math.random() > ((1 - candidate.viscocity.value) ** (curWaterflowPressure + 1))) {
                        var dx = target[0] - candidate.posX;
                        var dy = target[1] - candidate.posY;
                        if (Math.abs(dy) == 0 && Math.abs(dx) < 5) {
                            continue;
                        }
                        candidate.updatePosition(target[0], target[1]);
                    }
                }
            }
        }
    }
}

export {purge, reset, render, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquareAndChildren}