import { getSqIterationOrder, getSquares, iterateOnSquares, registerSqColChange, registerSqIterationRowChange } from "./squares/_sqOperations.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, resetWaterflowSquares
} from "./globals.js";

import { getObjectArrFromMap } from "./common.js";
import { removeItemAll } from "./common.js";
import { getCanvasSquaresX, getCanvasSquaresY } from "./canvas.js";
import { saveGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "./ui/UIData.js";
import { indexCanvasSize } from "./index.js";
import { resetFrameGroupCache } from "./waterGraph.js";

let frame_squares = null;
let frame_solid_squares = null;
let frame_water_squares = null;

let groupMinPosYMap = new Map();

export function getGroupMinPosY(group) {
    return groupMinPosYMap.get(group);
}

export function saveGroupMinHeight(group, posY) {
    groupMinPosYMap.set(group, Math.min((groupMinPosYMap.get(group) ?? 10 ** 8), posY));
}

export function periodicPurgeOldGroupData() {
    if (groupMinPosYMap.size() > 10000) {
        groupMinPosYMap.clear();
        iterateOnSquares((sq) => saveGroupMinHeight(sq.group, sq.posY));
    }
}

export function reset() {
    resetWaterflowSquares();
    resetFrameGroupCache();
    frame_squares = Array.from(getSqIterationOrder());
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

export function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

export function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

export function removeSquare(sq) {
    let arr = removeItemAll(getObjectArrFromMap(ALL_SQUARES, sq.posX, sq.posY), sq);
    if (arr.length === 0) {
        if ((ALL_SQUARES).has(sq.posX) && ALL_SQUARES.get(sq.posX).has(sq.posY))
            ALL_SQUARES.get(sq.posX).delete(sq.posY);
    }
    if (sq.proto != "PlantSquare") {
        registerSqIterationRowChange(sq.posY);
        registerSqColChange(sq.posX, sq.posY);
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
    indexCanvasSize();
}

export function doWaterFlow() {
    let candidateTargetKeys = WATERFLOW_TARGET_SQUARES.keys();
    candidateTargetKeys.filter((group) => WATERFLOW_CANDIDATE_SQUARES.has(group)).forEach((targetGroup) => {
        let candidateGroupMap = WATERFLOW_CANDIDATE_SQUARES.get(targetGroup);
        let targetGroupMap = WATERFLOW_TARGET_SQUARES.get(targetGroup);

        let candidatePressureKeys = Array.from(candidateGroupMap.keys()).sort((a, b) => a - b);
        let targetPressureKeys = Array.from(targetGroupMap.keys()).sort((a, b) => b - a);

        let candidate, candidateArr, candPressure, targPressure;
        targetPressureKeys.filter((v) => v > 0).forEach((targPressure) => {
            let targetPosArr = targetGroupMap.get(targPressure);
            let curTargetIdx = 0;
            while (curTargetIdx < targetPosArr.length) {
                let curTarg = targetPosArr[curTargetIdx];
                let curTargWater = getSquares(curTarg[0], curTarg[1]).find((sq) => sq.proto == "WaterSquare");
                let curTargHealth = curTargWater == null ? 0 : curTargWater.blockHealth;

                while (candidatePressureKeys.length > 0 && candidatePressureKeys.some((candidatePressure) => candidatePressure < targPressure)) {
                    let candPressure = candidatePressureKeys.find((candidatePressure) => candidatePressure < targPressure);
                    if (candidateGroupMap.get(candPressure).length == 0) {
                        candidatePressureKeys = removeItemAll(candidatePressureKeys, candPressure);
                        break;
                    }
                    let flowProbability = 1 - (Math.exp((candPressure - targPressure))) ** .3;
                    if (Math.random() < flowProbability) {
                        curTargetIdx += 1;
                        break;
                    }
                    candidateArr = candidateGroupMap.get(candPressure);
                    candidateArr.forEach((cand) => {
                        if (curTargHealth == 1) {
                            return true;
                        }
                        let candidateHealthApplied = Math.min(cand.blockHealth, 1 - curTargHealth);
                        curTargHealth += candidateHealthApplied;
                        if (curTargWater == null) {
                            let startX = cand.posX;
                            if (cand.updatePosition(curTarg[0], curTarg[1])) {
                                let side = (curTarg[0] - startX) > 0 ? 1 : -1;
                                cand.speedX = side * curTarg[2] * (Math.floor((targPressure - candPressure) ** 0.1));
                                removeItemAll(candidateArr, cand);
                            }
                        } else {
                            curTargWater.blockHealth += candidateHealthApplied;
                            cand.blockHealth -= candidateHealthApplied;
                            if (cand.blockHealth == 0) {
                                removeItemAll(candidateArr, cand);
                                cand.destroy();
                            }
                        }
                    })
                };
                curTargetIdx += 1;
            }
        });

    });
}