let ERASE_RADIUS = 2;

import { getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, transformPixelsToCanvasSquares } from "./canvas.js";
import { addTemperature, addWaterSaturationPascalsSqCoords } from "./climate/temperatureHumidity.js";
import { addWindPerssureMaintainHumidity, addWindPressureCloud, addWindPressureDryAir } from "./climate/wind.js";
import { removeSquare } from "./globalOperations.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { getLastMouseDown, getLastMoveOffset, getLeftMouseUpEvent, isLeftMouseClicked, isMiddleMouseClicked, isRightMouseClicked, setMouseTouchStartCallback } from "./mouse.js";
import { addNewOrganism } from "./organisms/_orgOperations.js";
import { WheatSeedOrganism } from "./organisms/agriculture/WheatOrganism.js";
import { KentuckyBluegrassSeedOrganism } from "./organisms/agriculture/KentuckyBluegrassOrganism.js";
import { STAGE_DEAD } from "./organisms/Stages.js";
import { addSquare, addSquareOverride, getSquares, removeSquarePos } from "./squares/_sqOperations.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { loadGD, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CLIMATE_WEATHER_TOOL_LIGHTCLOUD, UI_CLIMATE_WEATHER_TOOL_DRYAIR, UI_CLIMATE_WEATHER_TOOL_HEAVYCLOUD, UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_STRENGTH, UI_GODMODE_KILL, UI_GODMODE_MOISTURE, UI_GODMODE_SELECT, UI_GODMODE_STRENGTH, UI_GODMODE_TEMPERATURE, UI_ORGANISM_SELECT, UI_SM_CLIMATE, UI_SM_GODMODE, UI_SM_ORGANISM, UI_PALETTE_ACTIVE, UI_PALETTE_AQUIFER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE, UI_PALETTE_ROCKMODE, UI_PALETTE_SOILROCK, UI_PALETTE_WATER, UI_CLIMATE_SELECT_CLOUDS, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_CLIMATE_TOOL_SIZE } from "./ui/UIData.js";
import { eyedropperBlockClick, eyedropperBlockHover, isWindowHovered, mixerBlockClick } from "./ui/WindowManager.js";
import { CattailSeedOrganism } from "./organisms/midwest/CattailOrganism.js";
import { MushroomSeedOrganism } from "./organisms/fantasy/MushroomOrganism.js";
let prevManipulationOffset;

setMouseTouchStartCallback((inVal) => prevManipulationOffset = inVal);

let prevClickTime = 0;
let prevClickMap = new Map();

function doBrushFuncClickThrottle(x, y, func) {
    if (prevClickTime != getLastMouseDown()) {
        prevClickMap = new Map();
        prevClickTime = getLastMouseDown();
    }
    if (prevClickMap[x] == null)
        prevClickMap[x] = new Map(); 

    if (prevClickMap[x][y]) {
        if (Math.random() > 0.99) {
            // func(x, y);
        }
    } else {
        prevClickMap[x][y] = true;
        func(x, y);
    }
}
function doBrushFunc(centerX, centerY, func) {
    let radius = Math.floor(loadGD(UI_PALETTE_SIZE));
    if (loadGD(UI_CLIMATE_SELECT_CLOUDS)) {
        radius = loadGD(UI_CLIMATE_TOOL_SIZE);
    }
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (Math.ceil((i ** 2 + j ** 2) * 0.5) > radius) {
                continue;
            }
            if (Math.random() > loadGD(UI_PALETTE_STRENGTH) ** 2) {
                continue;
            }
            doBrushFuncClickThrottle(centerX + i, centerY + j, func);
        }
    }
}

export function addActivePaletteToolSquare(posX, posY) {
    if (loadGD(UI_PALETTE_ROCKMODE)) {
        addSquareOverride(new RockSquare(posX, posY));
    } else {
        addSquareOverride(new SoilSquare(posX, posY));
    }
}

export function addSquareByName(posX, posY, name) {
    let square;
    switch (name) {
        case "rock":
            square = addSquareOverride(new RockSquare(posX, posY));
            break;
        case "soil":
            getSquares(posX, posY).filter((sq) => sq.proto == "SoilSquare" || sq.proto == "WaterSquare").forEach(removeSquare);
            square = addSquare(new SoilSquare(posX, posY));
            break;
        case "water":
            square = addSquare(new WaterSquare(posX, posY));
            break;
        case "aquifer":
            square = addSquare(new AquiferSquare(posX, posY));
            break;
    };
    return square;
}

function killOrganismsAtSquare(posX, posY) {
    getOrganismSquaresAtSquare(posX, posY)
        .map((lsq) => lsq.linkedOrganism)
        .forEach((org) => org.stage = STAGE_DEAD);
}


function doBlockMod(posX, posY) {
    if (loadGD(UI_GODMODE_SELECT) == UI_GODMODE_TEMPERATURE) {
        if (!isRightMouseClicked())
            addTemperature(posX, posY, .5);
        else
            addTemperature(posX, posY, -0.5);
    }
    if (loadGD(UI_GODMODE_SELECT) == UI_GODMODE_MOISTURE) {
        if (!isRightMouseClicked())
            addWaterSaturationPascalsSqCoords(posX, posY, 10 * loadGD(UI_GODMODE_STRENGTH));
        else
            addWaterSaturationPascalsSqCoords(posX, posY, -10 * loadGD(UI_GODMODE_STRENGTH));
    }
    if (loadGD(UI_GODMODE_SELECT) == UI_GODMODE_KILL) {
        killOrganismsAtSquare(posX, posY);
    }
}

function doClimateMod(posX, posY) {
    if (posX < 0 || posY < 0 || posX >= getCanvasSquaresX() || posY >= getCanvasSquaresY()) {
        return;
    }

    let pressure = (isRightMouseClicked() ? -1 : 1) * loadGD(UI_CLIMATE_WEATHER_TOOL_STRENGTH)
    switch (loadGD(UI_CLIMATE_WEATHER_TOOL_SELECT)) {
        case UI_CLIMATE_WEATHER_TOOL_DRYAIR:
            addWindPressureDryAir(posX, posY, pressure);
            break;
        case UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR:
            addWindPerssureMaintainHumidity(posX, posY, pressure);
            break;

        case UI_CLIMATE_WEATHER_TOOL_LIGHTCLOUD:
            addWindPressureCloud(posX, posY, pressure, 1.01);
            break;

        case UI_CLIMATE_WEATHER_TOOL_HEAVYCLOUD:
            addWindPressureCloud(posX, posY, pressure, 1.1);
            break;
    }
}

export function doClickAddEyedropperMixer() {
    if (!getLeftMouseUpEvent()) {
        return;
    }
    let lastMoveOffset = getLastMoveOffset();
    if (lastMoveOffset == null || isMiddleMouseClicked() || isWindowHovered()) {
        return;
    }
    if (lastMoveOffset.x > getCanvasWidth() || lastMoveOffset > getCanvasHeight()) {
        return;
    }
    let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    let offsetX = offsetTransformed[0];
    let offsetY = offsetTransformed[1];

    if (loadGD(UI_PALETTE_EYEDROPPER)) {
        eyedropperBlockClick(offsetX, offsetY);
        return;
    }
    if (loadGD(UI_PALETTE_MIXER)) {
        mixerBlockClick(offsetX, offsetY);
        return;
    }
}

export function setPrevManipulationOffset(inLoc) {
    prevManipulationOffset = inLoc;
}

export function doClickAdd() {
    let lastMoveOffset = getLastMoveOffset();
    if (lastMoveOffset == null || isMiddleMouseClicked() || isWindowHovered()) {
        return;
    }


    if (isLeftMouseClicked() || isRightMouseClicked()) {
        if (lastMoveOffset.x > getCanvasWidth() || lastMoveOffset > getCanvasHeight()) {
            return;
        }
        let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
        let offsetX = offsetTransformed[0];
        let offsetY = offsetTransformed[1];

        if (loadGD(UI_PALETTE_ACTIVE) && (loadGD(UI_PALETTE_EYEDROPPER) || loadGD(UI_PALETTE_MIXER))) {
            return;
        }

        let prevOffsetX;
        let prevOffsetY;

        if (prevManipulationOffset == null) {
            prevOffsetX = offsetX;
            prevOffsetY = offsetY;
        } else {
            let prevOffsets = transformPixelsToCanvasSquares(prevManipulationOffset.x, prevManipulationOffset.y);
            prevOffsetX = prevOffsets[0];
            prevOffsetY = prevOffsets[1];
        }

        // point slope motherfuckers 

        let x1 = prevOffsetX;
        let x2 = offsetX;
        let y1 = prevOffsetY;
        let y2 = offsetY;

        let dx = x2 - x1;
        let dy = y2 - y1;
        let dz = Math.pow(dx ** 2 + dy ** 2, 0.5);

        let totalCount = Math.max(1, Math.round(dz));
        let ddx = dx / totalCount;
        let ddy = dy / totalCount;

        for (let i = 0; i < totalCount; i += 0.5) {
            let px = Math.floor(x1 + ddx * i);
            let py = Math.floor(y1 + ddy * i);
            if (loadGD(UI_CLIMATE_SELECT_CLOUDS)) {
                doBrushFunc(px, py, (x, y) => doClimateMod(x, y));
            } else if (loadGD(UI_SM_GODMODE)) {
                doBrushFunc(px, py, (x, y) => doBlockMod(x, y));
            } else if (loadGD(UI_PALETTE_ACTIVE)) {
                    let mode = loadGD(UI_PALETTE_SELECT);
                    if (mode == UI_PALETTE_SURFACE) {
                        doBrushFunc(px, py, (x, y) => {
                            let squares = getSquares(x, y);
                            if (isRightMouseClicked() && (squares.some((sq) => sq.solid && sq.surface))) {
                                squares.filter((sq) => !sq.solid).forEach((sq) => sq.destroy())
                            }
                            squares.filter((sq) => sq.solid).forEach((sq) => {
                                sq.surface = !isRightMouseClicked();
                                sq.surfaceLightingFactor = loadGD(UI_LIGHTING_SURFACE);
                            });
                        });
                    } else if (mode == UI_PALETTE_SURFACE_OFF) {
                        doBrushFunc(px, py, (x, y) => {
                            let squares = getSquares(x, y);
                            if ((squares.some((sq) => sq.solid && sq.surface))) {
                                squares.filter((sq) => !sq.solid).forEach((sq) => sq.destroy())
                            }
                            squares.filter((sq) => sq.solid).forEach((sq) => {
                                sq.surface = false;
                            });
                        });
                    }
                    else if (mode == UI_PALETTE_ERASE || isRightMouseClicked()) {
                        doBrushFunc(px, py, (x, y) => removeSquarePos(x, y));
                        continue;
                    } else if (mode == UI_PALETTE_SOILROCK) {
                        doBrushFunc(px, py, (x, y) => addActivePaletteToolSquare(x, y));
                    } else if (mode == UI_PALETTE_WATER) {
                        doBrushFunc(px, py, (x, y) => addSquareByName(x, y, "water"));
                    } else if (mode == UI_PALETTE_AQUIFER) {
                        addSquareByName(px, py, "aquifer")
                    }
            } else if (loadGD(UI_SM_ORGANISM)) {
                    let selectedOrganism = loadGD(UI_ORGANISM_SELECT);
                    let chance = Math.random();
                    switch (selectedOrganism) {
                        case "wheat":
                            if (chance > 0.99) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new WheatSeedOrganism(sq));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "k. bluegrass":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new KentuckyBluegrassSeedOrganism(sq, [Math.random()]));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "cattail":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new CattailSeedOrganism(sq));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "mushroom1":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new MushroomSeedOrganism(sq, [Math.random(), 0]));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "mushroom2":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new MushroomSeedOrganism(sq, [Math.random(), 1]));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "mushroom3":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new MushroomSeedOrganism(sq, [0.0001 + .25 * Math.random(), 0]));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                        case "mushroom4":
                            if (chance > 0.95) {
                                let sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    let orgAdded = addNewOrganism(new MushroomSeedOrganism(sq, [.749999 + 0.25 * Math.random(), 0]));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                    }
                }
        }
    } else {
        doBlockHover(lastMoveOffset);
    }
    prevManipulationOffset = lastMoveOffset;
}

function doBlockHover(lastMoveOffset) {
    let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    let offsetX = offsetTransformed[0];
    let offsetY = offsetTransformed[1];
    eyedropperBlockHover(offsetX, offsetY);
}