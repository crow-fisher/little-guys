let ERASE_RADIUS = 2;

import { getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, transformPixelsToCanvasSquares } from "./canvas.js";
import { addTemperature, addWaterSaturationPascalsSqCoords } from "./climate/simulation/temperatureHumidity.js";
import { addWindPerssureMaintainHumidity, addWindPressureCloud, addWindPressureDryAir } from "./climate/simulation/wind.js";
import { removeSquare } from "./globalOperations.js";
import { getLastMouseDown, getLastMoveOffset, getLeftMouseUpEvent, isLeftMouseClicked, isMiddleMouseClicked, isRightMouseClicked, setMouseTouchStartCallback } from "./mouse.js";
import { WheatSeedOrganism } from "./organisms/grasses/WheatOrganism.js";
import { KentuckyBluegrassSeedOrganism } from "./organisms/grasses/KentuckyBluegrassOrganism.js";
import { addSquare, addSquareOverride, getSquares, removeSquarePos } from "./squares/_sqOperations.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { loadGD, UI_PALETTE_EYEDROPPER, UI_PALETTE_MIXER, UI_PALETTE_SIZE, UI_PALETTE_STRENGTH, UI_CLIMATE_WEATHER_TOOL_CLOUD, UI_CLIMATE_WEATHER_TOOL_DRYAIR, UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR, UI_CLIMATE_WEATHER_TOOL_SELECT, UI_CLIMATE_WEATHER_TOOL_STRENGTH, UI_GODMODE_KILL, UI_GODMODE_MOISTURE, UI_GODMODE_SELECT, UI_GODMODE_STRENGTH, UI_GODMODE_TEMPERATURE, UI_ORGANISM_SELECT, UI_SM_GODMODE, UI_SM_ORGANISM, UI_PALETTE_ACTIVE, UI_PALETTE_AQUIFER, UI_PALETTE_SELECT, UI_PALETTE_SURFACE, UI_PALETTE_SOILROCK, UI_PALETTE_WATER, UI_CLIMATE_SELECT_CLOUDS, UI_LIGHTING_SURFACE, UI_PALETTE_ERASE, UI_PALETTE_SURFACE_OFF, UI_CLIMATE_TOOL_SIZE, UI_PALETTE_MODE_ROCK, UI_PALETTE_MODE, UI_PALLETE_MODE_SPECIAL, isEyedropperOrMixerClicked, UI_ORGANISM_GRASS_WHEAT, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_CATTAIL, UI_ORGANISM_TREE_PALM, UI_ORGANISM_FLOWER_CONEFLOWER, UI_ORGANISM_MOSS_PLEUROCARP, UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY, UI_PALETTE_SPECIAL_CHURN, UI_PALETTE_SPECIAL_CHURN_STRENGTH, UI_PALETTE_SPECIAL_CHURN_WIDE, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y } from "./ui/UIData.js";
import { clearMouseHoverColorCacheMap, eyedropperBlockClick, eyedropperBlockHover, isWindowHovered, mixerBlockClick } from "./ui/WindowManager.js";
import { PalmTreeSeedOrganism } from "./organisms/trees/PalmTreeOrganism.js";
import { CattailSeedOrganism } from "./organisms/grasses/CattailOrganism.js";
import { ConeflowerSeedOrganism } from "./organisms/flowers/ConeflowerOrganism.js";
import { PleurocarpMossSeedOrganism } from "./organisms/mosses/PleurocarpMossOrganism.js";
import { randNumber, randRange } from "./common.js";
let prevManipulationOffset;

setMouseTouchStartCallback((inVal) => prevManipulationOffset = inVal);

let prevClickTime = 0;
let prevClickMap = new Map();

function doBrushFuncClickThrottle(x, y, func, throttle=true) {
    if (!throttle) {
        func(x, y);
        return;
    }
    if (prevClickTime != getLastMouseDown()) {
        prevClickMap = new Map();
        prevClickTime = getLastMouseDown();
    }
    if (prevClickMap[x] == null)
        prevClickMap[x] = new Map();

    if (prevClickMap[x][y]) {
        if (Math.random() > 0.90) {
            func(x, y);
        }
    } else {
        prevClickMap[x][y] = true;
        func(x, y);
    }
}
export function doBrushFunc(centerX, centerY, func, throttle=true) {
    throttle = false;
    let radius = Math.floor(loadGD(UI_PALETTE_SIZE));
    if (loadGD(UI_CLIMATE_SELECT_CLOUDS)) {
        radius = loadGD(UI_CLIMATE_TOOL_SIZE);
    }
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (Math.ceil((i ** 2 + j ** 2) * 0.5) > radius) {
                continue;
            }
            if (throttle && Math.random() > loadGD(UI_PALETTE_STRENGTH) ** 2) {
                continue;
            }
            doBrushFuncClickThrottle(centerX + i, centerY + j, func, throttle);
        }
    }
}

export function addActivePaletteToolSquare(posX, posY) {
    if (loadGD(UI_PALETTE_MODE) == UI_PALETTE_MODE_ROCK) {
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
            let prevSurfaceLightingFactor = 
            getSquares(posX, posY).filter((sq) => sq.proto == "SoilSquare" || sq.proto == "WaterSquare").forEach((sq) => {
                prevSurfaceLightingFactor = sq.surfaceLightingFactor;
                removeSquare(sq);
            });
            square = addSquare(new SoilSquare(posX, posY));
            square.surfaceLightingFactor = prevSurfaceLightingFactor;
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
    if (posX < 0 || posY < 0 || posX >= loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) || posY >= loadGD(UI_GAME_MAX_CANVAS_SQUARES_Y)) {
        return;
    }

    let pressure = (isRightMouseClicked() ? -1 : 1) * loadGD(UI_CLIMATE_WEATHER_TOOL_STRENGTH) ** 4
    switch (loadGD(UI_CLIMATE_WEATHER_TOOL_SELECT)) {
        case UI_CLIMATE_WEATHER_TOOL_DRYAIR:
            addWindPressureDryAir(posX, posY, pressure);
            break;
        case UI_CLIMATE_WEATHER_TOOL_MATCHEDAIR:
            addWindPerssureMaintainHumidity(posX, posY, pressure);
            break;

        case UI_CLIMATE_WEATHER_TOOL_CLOUD:
            addWindPressureCloud(posX, posY, pressure, loadGD(UI_CLIMATE_WEATHER_TOOL_CLOUD_HUMIDITY));
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

    if (loadGD(UI_PALETTE_SELECT) == UI_PALETTE_EYEDROPPER) {
        eyedropperBlockClick(offsetX, offsetY);
        return;
    }
    if (loadGD(UI_PALETTE_SELECT) == UI_PALETTE_MIXER) {
        mixerBlockClick(offsetX, offsetY);
        return;
    }
}

export function setPrevManipulationOffset(inLoc) {
    prevManipulationOffset = inLoc;
}

function churnBlocks(x, y, wide=false) {
    getSquares(x, y)
        .filter((sq) => sq.linkedOrganismSquares.length == 0 && sq.linkedOrganisms.length == 0 && sq.physicsEnabled && sq.gravity > 0)
        .forEach((sq) => {
            let st = .5 * loadGD(UI_PALETTE_SPECIAL_CHURN_STRENGTH);
            sq.spawnParticle(0, -10, (wide ? 100 : 10) * randRange(-.1, .1), -st * randRange(.95, 1.05), randRange(.1, .4));
        });
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
        clearMouseHoverColorCacheMap();
        let offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
        let offsetX = offsetTransformed[0];
        let offsetY = offsetTransformed[1];

        if (loadGD(UI_PALETTE_ACTIVE) && isEyedropperOrMixerClicked()) {
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

        let iAdd = 0.5;
        if (loadGD(UI_CLIMATE_SELECT_CLOUDS)) {
            iAdd *= 32;
        }

        for (let i = 0; i < totalCount; i += iAdd) {
            let px = Math.floor(x1 + ddx * i);
            let py = Math.floor(y1 + ddy * i);
            if (loadGD(UI_CLIMATE_SELECT_CLOUDS)) {
                doBrushFunc(px, py, (x, y) => doClimateMod(x, y));
            } else if (loadGD(UI_SM_GODMODE)) {
                doBrushFunc(px, py, (x, y) => doBlockMod(x, y));
            } else if (loadGD(UI_PALETTE_ACTIVE)) {
                let mode = loadGD(UI_PALETTE_MODE);
                let selectMode = loadGD(UI_PALETTE_SELECT);

                if (selectMode == UI_PALETTE_SPECIAL_CHURN) {
                    doBrushFunc(px, py, (x, y) => churnBlocks(x, y));
                }
                else if (selectMode == UI_PALETTE_SPECIAL_CHURN_WIDE) {
                    doBrushFunc(px, py, (x, y) => churnBlocks(x, y, true));
                }
                else if (selectMode != UI_PALETTE_SURFACE && selectMode != UI_PALETTE_SURFACE_OFF && (selectMode == UI_PALETTE_ERASE || isRightMouseClicked())) {
                    doBrushFunc(px, py, (x, y) => removeSquarePos(x, y));
                    continue;
                } else if (selectMode == UI_PALETTE_SOILROCK) {
                    doBrushFunc(px, py, (x, y) => addActivePaletteToolSquare(x, y));
                } else if (mode == UI_PALLETE_MODE_SPECIAL) {
                    if (selectMode == UI_PALETTE_SURFACE) {
                        doBrushFunc(px, py, (x, y) => {
                            let squares = getSquares(x, y);
                            if (isRightMouseClicked() && (squares.some((sq) => sq.solid && sq.surface))) {
                                squares.filter((sq) => !sq.solid).forEach((sq) => sq.destroy())
                            }
                            squares.filter((sq) => sq.solid).forEach((sq) => {
                                sq.surface = !isRightMouseClicked();
                                sq.surfaceLightingFactor = (1 - loadGD(UI_LIGHTING_SURFACE));
                            });
                        });
                    } else if (selectMode == UI_PALETTE_SURFACE_OFF) {
                        doBrushFunc(px, py, (x, y) => {
                            let squares = getSquares(x, y);
                            if ((squares.some((sq) => sq.solid && sq.surface))) {
                                squares.filter((sq) => !sq.solid).forEach((sq) => sq.destroy())
                            }
                            squares.filter((sq) => sq.solid).forEach((sq) => {
                                sq.surface = false;
                            });
                        });
                    } else if (selectMode == UI_PALETTE_WATER) {
                        doBrushFunc(px, py, (x, y) => addSquareByName(x, y, "water"));
                    } else if (selectMode == UI_PALETTE_AQUIFER) {
                        addSquareByName(px, py, "aquifer")
                    }
                }
            } else if (loadGD(UI_SM_ORGANISM)) {
                placeActiveSeed(px, py);
            } else {
                doBrushFunc(px, py, (x, y) => addWindPressureDryAir(x, y, loadGD(UI_CLIMATE_WEATHER_TOOL_STRENGTH)));
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

function placeActiveSeed(px, py) {
    let chance = Math.random();
    switch (loadGD(UI_ORGANISM_SELECT)) {
        case UI_ORGANISM_GRASS_WHEAT:
            if (chance > 0.99) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new WheatSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;
        case UI_ORGANISM_GRASS_KBLUE:
            if (chance > 0.95) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new KentuckyBluegrassSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;
        case UI_ORGANISM_GRASS_CATTAIL:
            if (chance > 0.95) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new CattailSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;
        
        case UI_ORGANISM_MOSS_PLEUROCARP:
            if (chance > 0.95) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new PleurocarpMossSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;

        case UI_ORGANISM_FLOWER_CONEFLOWER:
            if (chance > 0.95) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new ConeflowerSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;

        case UI_ORGANISM_TREE_PALM:
        default:
            if (chance > 0.95) {
                let sq = addSquare(new SeedSquare(px, py));
                if (sq) {
                    let orgAdded = new PalmTreeSeedOrganism(sq);
                    if (!orgAdded) {
                        sq.destroy();
                    }
                }
            }
            break;
    }
}