import { getFirstLevelSquares, getSquares, registerSqColChange, registerSqIterationRowChange } from "./squares/_sqOperations.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";
import {
    ALL_SQUARES, WATERFLOW_TARGET_SQUARES, WATERFLOW_CANDIDATE_SQUARES, resetWaterflowSquares
} from "./globals.js";

import { removeItemAll } from "./common.js";
import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, getFrameXMax, getFrameXMin, getFrameYMax, getFrameYMin, zoomCanvasFillRect } from "./canvas.js";
import { loadGD, saveGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "./ui/UIData.js";
import { indexCanvasSize, MAIN_CONTEXT } from "./index.js";
import { registerSquare, resetFrameGroupCache, waterGraphReset } from "./waterGraph.js";
import { RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "./colors.js";
import { calculateColorProvideOpacity } from "./climate/simulation/temperatureHumidity.js";
import { getPlayerXMaxOffset, getPlayerXMinOffset } from "./player/playerMain.js";

let frame_squares = null;
let frame_simulation_squares = new Array();
let frame_simulation_organisms = new Array();
let frame_solid_squares = null;
let frame_water_squares = null;

let groupMinPosYMap = new Map(); // this is what's doing de bad

export function getGroupMinPosY(group) {
    return groupMinPosYMap.get(group);
}

export function saveGroupMinHeight(group, posY) {
    groupMinPosYMap.set(group, Math.min((groupMinPosYMap.get(group) ?? 10 ** 8), posY));
}

export function periodicPurgeOldGroupData() {
    if (groupMinPosYMap.size > 1000) {
        groupMinPosYMap.clear();
        waterGraphReset();
        getFrameSimulationSquares().forEach((sq) => {
            saveGroupMinHeight(sq.group, sq.posY);
            registerSquare(sq.posX, sq.posY, sq.group);
        });
    }
}

export function getFrameSimulationSquares() {
    return frame_simulation_squares;
}

export function getFrameSimulationOrganisms() {
    return frame_simulation_organisms;
}

export function reset() {
    resetWaterflowSquares();
    resetFrameGroupCache();

    frame_simulation_squares.forEach((sq) => sq.reset());
    
    frame_simulation_squares = new Array();
    frame_simulation_organisms = new Array();

    for (let i = getFrameXMin() - getPlayerXMinOffset(); i < getFrameXMax() + getPlayerXMaxOffset(); i++) {
        let firstLevel = getFirstLevelSquares(i);
        if (firstLevel.size == 0)
            continue;
        let keys = Array.from(firstLevel.keys()).sort((a, b) => a - b);
        let min = keys.at(0);
        let max = keys.at(keys.length - 1);

        for (let j = Math.min(max, getFrameYMax() + 1); j >= Math.max(min, getFrameYMin() - 1); j--) {
            if (firstLevel.has(j))
                firstLevel.get(j).forEach((sq) => {
                    sq.linkedOrganisms.forEach((org) => frame_simulation_organisms.push(org));
                    frame_simulation_squares.push(sq);
                });
        }
    }

    frame_solid_squares = frame_simulation_squares.filter((sq) => sq.solid);
    frame_water_squares = frame_simulation_squares.filter((sq) => !sq.solid);
}

export function renderSquares() {
    frame_simulation_squares.forEach((sq) => sq.render());
}

export function renderSolidSquares() {
    frame_solid_squares.forEach((sq) => sq.render());
}

export function renderWaterSquares() {
    frame_water_squares.forEach((sq) => sq.render());
}

export function physics() {
    frame_simulation_squares.forEach((sq) => sq.physicsBefore());
    frame_simulation_squares.forEach((sq) => sq.physics());
}

export function processOrganisms() {
    iterateOnOrganisms((org) => org.process(), 0);
}

export function renderOrganisms() {
    iterateOnOrganisms((org) => org.render(), 0);
}

export function removeSquare(sq) {
    let posX = Math.floor(sq.posX);
    let posY = Math.floor(sq.posY);

    let arr = removeItemAll(getSquares(posX, posY), sq);
    if (arr.length === 0) {
        if ((ALL_SQUARES).has(posX) && ALL_SQUARES.get(posX).has(posY))
            ALL_SQUARES.get(posX).delete(posY);
    }
    if (sq.proto != "PlantSquare") {
        registerSqIterationRowChange(posY);
        registerSqColChange(posX, posY);
    }
}

export function purgeCanvasFrameLimit() {
    let rootKeys = ALL_SQUARES.keys();
    let curX = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize();
    let end = Math.ceil(curX + getCanvasSquaresX())
    rootKeys.forEach((key) => {
        let subkeys = ALL_SQUARES.get(key).keys();
        subkeys.forEach((subkey) => {
            if (subkey >= 0 && subkey < getCanvasSquaresY()) {
                return;
            }
            ALL_SQUARES.get(key).get(subkey).forEach((sq) => sq.destroy(true));
            ALL_SQUARES.get(key).delete(subkey);
        });
        if (key < 0 || key >= (curX + getCanvasSquaresX())) {
            subkeys.forEach((subkey) => {
                ALL_SQUARES.get(key).get(subkey).forEach((sq) => sq.destroy(true));
                ALL_SQUARES.get(key).delete(subkey);
            });
            ALL_SQUARES.delete(key);
        }
    });
    saveGD(UI_GAME_MAX_CANVAS_SQUARES_X, end);
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

        targetPressureKeys.filter((v) => v > 0).forEach((targPressure) => {
            let targetPosArr = targetGroupMap.get(targPressure);
            let curTargetIdx = 0;
            while (curTargetIdx < targetPosArr.length) {
                let curTarg = targetPosArr[curTargetIdx];
                let curTargWater = getSquares(curTarg[0], curTarg[1]).find((sq) => sq.proto == "WaterSquare");
                let curTargSoil = getSquares(curTarg[0], curTarg[1]).find((sq) => sq.proto == "SoilSquare");

                let curTargHealth = curTargWater == null ? 0 : curTargWater.blockHealth;
                curTargetIdx += 1;
                while (
                    curTargHealth < 1 &&
                    candidatePressureKeys.length > 0 &&
                    candidatePressureKeys.some((candidatePressure) => candidatePressure < targPressure)
                ) {
                    let candPressure = candidatePressureKeys.find((candidatePressure) => candidatePressure < targPressure);
                    if (candidateGroupMap.get(candPressure).length == 0) {
                        candidatePressureKeys = removeItemAll(candidatePressureKeys, candPressure);
                        break;
                    }
                    let flowProbability = 1 - (Math.exp((candPressure - targPressure))) ** .15;
                    if (curTargSoil != null) {
                        flowProbability /= (50 + curTargSoil.getWaterflowRate());
                    }

                    if (Math.random() > flowProbability) {
                        break;
                    }
                    let candidateArr = candidateGroupMap.get(candPressure);
                    candidateArr.forEach((cand) => {
                        if (curTargHealth == 1) {
                            return true;
                        }
                        let curCandSoil = getSquares(cand.posX, cand.posY).find((sq) => sq.proto == "SoilSquare");

                        if (curCandSoil != null) {
                            if (Math.random() > (1 / curCandSoil.getWaterflowRate())) {
                                return;
                            }
                        }

                        let candidateHealthApplied = Math.min(cand.blockHealth, 1 - curTargHealth);
                        curTargHealth += candidateHealthApplied;
                        if (curTargWater == null) {
                            let startX = cand.posX;
                            if (cand.updatePosition(curTarg[0], curTarg[1])) {
                                let side = (curTarg[0] - startX) > 0 ? 1 : -1;
                                cand.speedX = side * curTarg[2] * (Math.floor((targPressure - candPressure) ** 0.1));
                                cand.speedY = 0;
                                removeItemAll(candidateArr, cand);
                                cand.currentPressureDirect = -1;
                                cand.calculateDirectPressure();

                                cand.lighting = [];
                                cand.initLightingFromNeighbors();
                                curTargWater = cand;

                                for (let i = 0; i < cand.posHistoryRetentionLength; i++) {
                                    cand.posHistoryMap[i] = [cand.posX, cand.posY]
                                }
                            }
                        } else {
                            curTargWater.blockHealth += candidateHealthApplied;
                            cand.blockHealth -= candidateHealthApplied;
                            if (cand.blockHealth == 0) {
                                removeItemAll(candidateArr, cand);
                                cand.destroy();
                            }
                        }
                    });
                };
            }
        });

    });
}

export function renderTargetMap() {
    WATERFLOW_TARGET_SQUARES.keys().forEach((group) => {
        let minPressure = Math.min(...WATERFLOW_TARGET_SQUARES.get(group).keys().filter((val) => !(isNaN(val))))
        let maxPressure = Math.max(...WATERFLOW_TARGET_SQUARES.get(group).keys().filter((val) => !(isNaN(val))))

        WATERFLOW_TARGET_SQUARES.get(group).keys().forEach((pressure) => {
            let arr = WATERFLOW_TARGET_SQUARES.get(group).get(pressure);
            MAIN_CONTEXT.fillStyle = calculateColorProvideOpacity(pressure, minPressure, maxPressure, RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED, 1);
            arr.forEach((loc) => {
                zoomCanvasFillRect(
                    loc[0] * getBaseSize(),
                    loc[1] * getBaseSize(),
                    getBaseSize(),
                    getBaseSize()
                );
            });
        })
    })
}

export function renderCandidateMap() {
    WATERFLOW_CANDIDATE_SQUARES.keys().forEach((group) => {
        let minPressure = Math.min(...WATERFLOW_CANDIDATE_SQUARES.get(group).keys().filter((val) => !(isNaN(val))))
        let maxPressure = Math.max(...WATERFLOW_CANDIDATE_SQUARES.get(group).keys().filter((val) => !(isNaN(val))))

        WATERFLOW_CANDIDATE_SQUARES.get(group).keys().forEach((pressure) => {
            let arr = WATERFLOW_CANDIDATE_SQUARES.get(group).get(pressure);
            MAIN_CONTEXT.fillStyle = calculateColorProvideOpacity(pressure, minPressure, maxPressure, RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED, 1);
            arr.forEach((sq) => {
                zoomCanvasFillRect(
                    sq.posX * getBaseSize(),
                    sq.posY * getBaseSize(),
                    getBaseSize(),
                    getBaseSize()
                );
            });
        })
    })
}