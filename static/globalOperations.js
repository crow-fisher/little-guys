import { getSqIterationOrder, iterateOnSquares } from "./squares/_sqOperations.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISM_SQUARES, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, resetWaterflowSquares
} from "./globals.js";

import { getObjectArrFromMap } from "./common.js";
import { removeItemAll } from "./common.js";
import { getCanvasSquaresX, getCanvasSquaresY } from "./canvas.js";

let frame_squares = null;
let frame_solid_squares = null;
let frame_water_squares = null;

export function reset() {
    resetWaterflowSquares();
    frame_squares = getSqIterationOrder();
    frame_solid_squares = frame_squares.filter((sq) => sq.solid);
    frame_water_squares = frame_squares.filter((sq) => !sq.solid);
    frame_squares.forEach((sq) => sq.reset());

}

export function renderSquares() {
    frame_squares.forEach((sq) => sq.render());
}

export function renderSolidSquares() {
    frame_solid_squares.forEach((sq) => sq.render());
}

export function renderWaterSquares() {
    frame_water_squares.forEach((sq) => sq.render());
}

export function physics() {
    frame_squares.forEach((sq) => sq.physicsBefore());
    frame_squares.forEach((sq) => sq.physics());
}

export function physicsOnlyGravity() {
    frame_solid_squares.forEach((sq) => sq.gravityPhysics());
    frame_solid_squares.forEach((sq) => sq.waterSinkPhysics());
}
export function physicsOnlyWater() {
    frame_water_squares.forEach((sq) => sq.physicsBefore());
    frame_water_squares.forEach((sq) => sq.physics());
}

export function physicsWaterSimplePhysics() {
    frame_water_squares.forEach((sq) => sq.physicsBefore());
    frame_water_squares.forEach((sq) => sq.physicsSimple());
}

export function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

export function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

export function removeSquare(square) {
    removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
}


export function doWaterFlow() {
    let candidateTargetKeys = Array.from(Object.keys(WATERFLOW_TARGET_SQUARES));

    candidateTargetKeys.filter((group) => group in WATERFLOW_CANDIDATE_SQUARES).forEach((targetGroup) => {
        let candidateGroupMap = WATERFLOW_CANDIDATE_SQUARES[targetGroup];
        let targetGroupMap = WATERFLOW_TARGET_SQUARES[targetGroup];

        let candidatePressureKeys = Array.from(Object.keys(candidateGroupMap)).sort((a, b) => a - b);
        let targetPressureKeys = Array.from(Object.keys(targetGroupMap)).sort((a, b) => b - a);

        let candidateOffset = 0;
        let i = 0;

        while (true) {
            let currentTarget = parseInt(targetPressureKeys[i]);
            let currentCandidate = parseInt(candidatePressureKeys[i + candidateOffset]);
            if (currentCandidate < currentTarget) {
                // pair off
                let targetIdx = 0;
                let targetArr = targetGroupMap[currentTarget];

                candidateGroupMap[currentCandidate].forEach((sq) => {
                    if (targetIdx >= targetArr.length) {
                        return;
                    } else {
                        if (Math.random() > (0.90) ** (currentTarget - currentCandidate)) {
                            let targetPos = targetArr[targetIdx];
                            sq.updatePosition(targetPos[0], targetPos[1]);
                            sq.speedX = targetPos[2] * (Math.floor((currentTarget - currentCandidate) ** 0.25));
                        }
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