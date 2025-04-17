import { getSqIterationOrder, iterateOnSquares } from "./squares/_sqOperations.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISM_SQUARES, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, resetWaterflowSquares
} from "./globals.js";

import { getObjectArrFromMap } from "./common.js";
import { removeItemAll } from "./common.js";
import { getCanvasSquaresX, getCanvasSquaresY } from "./canvas.js";
import { loadGD, saveGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "./ui/UIData.js";

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
    frame_squares.forEach((sq) => sq.physicsBefore());
    frame_solid_squares.forEach((sq) => sq.physicsSimple());
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
    let arr = removeItemAll(getObjectArrFromMap(ALL_SQUARES, square.posX, square.posY), square);
    if (arr.length === 0) {
        if ((ALL_SQUARES).has(square.posX) && ALL_SQUARES.get(square.posX).has(square.posY))
            ALL_SQUARES.get(square.posX).delete(square.posY);
    }
}

export function purgeCanvasFrameLimit() {
    let rootKeys = ALL_SQUARES.keys();
    rootKeys.forEach((key) => {
        let subkeys = ALL_SQUARES.get(key).keys();
        subkeys.forEach((subkey) => {
            if (subkey >= 0 && subkey < getCanvasSquaresY()) {
                return;
            }
            ALL_SQUARES.get(key).get(subkey).forEach((sq) => sq.destroy(true));
            ALL_SQUARES.get(key).delete(subkey);
        });
        if (key < 0 || key >= getCanvasSquaresX()) {
            subkeys.forEach((subkey) => {
                ALL_SQUARES.get(key).get(subkey).forEach((sq) => sq.destroy(true));
                ALL_SQUARES.get(key).delete(subkey);
            });
            ALL_SQUARES.delete(key);
        }
    });
    saveGD(UI_GAME_MAX_CANVAS_SQUARES_X, getCanvasSquaresX() + 1);
    saveGD(UI_GAME_MAX_CANVAS_SQUARES_Y, getCanvasSquaresY() + 1);
}

export function doWaterFlow() {
    let candidateTargetKeys = WATERFLOW_TARGET_SQUARES.keys();
    candidateTargetKeys.filter((group) => WATERFLOW_CANDIDATE_SQUARES.has(group)).forEach((targetGroup) => {
        let candidateGroupMap = WATERFLOW_CANDIDATE_SQUARES.get(targetGroup);
        let targetGroupMap = WATERFLOW_TARGET_SQUARES.get(targetGroup);

        let candidatePressureKeys = Array.from(candidateGroupMap.keys()).sort((a, b) => a - b);
        let targetPressureKeys = Array.from(targetGroupMap.keys()).sort((a, b) => b - a);

        let candidateOffset = 0;
        let i = 0;

        let candidate, candidateArr, pCand, PTarg;

        targetPressureKeys.forEach((targetPressure) => {
            let targetPosArr = targetGroupMap.get(targetPressure);
            let curTargetIdx = 0;

            while (curTargetIdx < targetPosArr.length) {
                let curTarget = targetPosArr[curTargetIdx];
                while (candidatePressureKeys.length > 0) {
                    let candidatePressure = candidatePressureKeys.find((candidatePressure) => candidatePressure < targetPressure);
                    if (candidatePressure == null) {
                        return;
                    }
                    if (candidateGroupMap.get(candidatePressure).length == 0) {
                        candidatePressureKeys = removeItemAll(candidatePressureKeys, candidatePressure);
                        curTargetIdx += 1;
                        continue;
                    }
                    candidateArr = candidateGroupMap.get(candidatePressure);
                    candidate = candidateArr.at(0);
                    pCand = candidatePressure;
                    PTarg = targetPressure;
                    break;
                }
                curTargetIdx += 1;
                if (candidate == null) {
                    return;
                }

                removeItemAll(candidateArr, candidate);
                if (curTarget[1] >= getCanvasSquaresY()) {
                    candidate.destroy();
                    return;
                }

                if (Math.random() > (0.8) ** (PTarg - pCand)) {
                    if (candidate.updatePosition(curTarget[0], curTarget[1])) {
                        candidate.speedX = curTarget[2] * (Math.floor((PTarg - pCand) ** 0.25));
                    }
                }
            }
        });

    });
}