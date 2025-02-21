var ERASE_RADIUS = 2;

import { getCanvasHeight, getCanvasWidth, transformPixelsToCanvasSquares } from "./canvas.js";
import { randNumber } from "./common.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { triggerEarlySquareScheduler } from "./main.js";
import { getLastMoveOffset, isLeftMouseClicked, isMiddleMouseClicked, isRightMouseClicked } from "./mouse.js";
import { addNewOrganism } from "./organisms/_orgOperations.js";
import { WheatSeedOrganism } from "./organisms/agriculture/WheatOrganism.js";
import { addSquare, addSquareOverride, getSquares, removeSquarePos } from "./squares/_sqOperations.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { loadUI, saveUI, UI_BB_EYEDROPPER, UI_BB_MODE, UI_BB_SIZE, UI_MODE_ROCK, UI_MODE_SOIL, UI_ORGANISM_SELECT, UI_SM_BB, UI_SM_ORGANISM, UI_SM_SPECIAL, UI_SM_VIEWMODE, UI_SPECIAL_AQUIFER, UI_SPECIAL_MIX, UI_SPECIAL_SELECT, UI_SPECIAL_SURFACE, UI_SPECIAL_WATER, UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE } from "./ui/UIData.js";
import { eyedropperBlockClick, eyedropperBlockHover, isWindowHovered } from "./ui/WindowManager.js";
var prevManipulationOffset;

function doBlockBlur(centerX, centerY, size) {
    if (Math.random() > 0.5) {
        return;
    }
    var rx = randNumber(-size / 2, size / 2);
    var ry = randNumber(-size / 2, size / 2);
    var len = ((rx ** 2) + (ry ** 2)) ** 0.5;

    if (len > size) {
        rx /= (size / len);
        ry /= (size / len);
    }
    var otherX = centerX + rx;
    var otherY = centerY + ry;
    var middleX = 10 ** 8;
    var middleY = 10 ** 8;

    if (
        getOrganismSquaresAtSquare(centerX, centerY).length > 0 ||
        getOrganismSquaresAtSquare(otherX, otherY).length > 0) {
        return;
    }

    getSquares(otherX, otherY).filter((sq) => sq.gravity != 0).forEach((sq) => sq.updatePosition(middleX, middleY));
    getSquares(centerX, centerY).filter((sq) => sq.gravity != 0).forEach((sq) => sq.updatePosition(otherX, otherY));
    getSquares(middleX, middleY).filter((sq) => sq.gravity != 0).forEach((sq) => sq.updatePosition(centerX, centerY));
}


function doBrushFunc(centerX, centerY, func) {
    var radius = Math.floor(loadUI(UI_BB_SIZE));
    for (var i = -radius; i < radius; i++) {
        for (var j = -radius; j < radius; j++) {
            if (Math.abs(i) + Math.abs(j) + 2 > (radius ** 2 + radius ** 2) ** 0.5) {
                continue;
            }
            func(centerX + i, centerY + j);
        }
    }
}

export function addSquareByName(posX, posY, name) {
    var square;
    switch (name) {
        case "rock":
            square = addSquareOverride(new RockSquare(posX, posY));
            break;
        case "soil":
            square = addSquareOverride(new SoilSquare(posX, posY));
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
    if (blockModification_val == "markSurface") {
        getSquares(posX, posY)
            .filter((sq) => sq.solid && sq.collision)
            .forEach((sq) => sq.surface = !rightMouseClicked);
        getNeighbors(posX, posY)
            .filter((sq) => sq.solid && sq.collision)
            .forEach((sq) => sq.surface = !rightMouseClicked);
    }

    if (blockModification_val == "wind") {
        if (!rightMouseClicked)
            addWindPressure(posX, posY);
        else
            removeWindPressure(posX, posY);
    }

    if (blockModification_val == "temperature") {
        if (!rightMouseClicked)
            addTemperature(posX, posY, .5);
        else
            addTemperature(posX, posY, -0.5);
    }
    if (blockModification_val == "humidity") {
        if (!rightMouseClicked)
            addWaterSaturationPascalsSqCoords(posX, posY, 100);
        else
            addWaterSaturationPascalsSqCoords(posX, posY, -100);
    }
}

export function doClickAdd() {
    let lastMoveOffset = getLastMoveOffset();
    if (lastMoveOffset == null || isMiddleMouseClicked() || isWindowHovered()) {
        return;
    }

    triggerEarlySquareScheduler();

    if (isLeftMouseClicked() || isRightMouseClicked()) {
        if (lastMoveOffset.x > getCanvasWidth() || lastMoveOffset > getCanvasHeight()) {
            return;
        }
        var offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
        var offsetX = offsetTransformed[0];
        var offsetY = offsetTransformed[1];

        if (loadUI(UI_BB_EYEDROPPER)) {
            eyedropperBlockClick(offsetX, offsetY);
            return;
        }

        var prevOffsetX;
        var prevOffsetY;

        if (prevManipulationOffset == null) {
            prevOffsetX = offsetX;
            prevOffsetY = offsetY;
        } else {
            var prevOffsets = transformPixelsToCanvasSquares(prevManipulationOffset.x, prevManipulationOffset.y);
            prevOffsetX = prevOffsets[0];
            prevOffsetY = prevOffsets[1];
        }

        // point slope motherfuckers 

        var x1 = prevOffsetX;
        var x2 = offsetX;
        var y1 = prevOffsetY;
        var y2 = offsetY;

        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = Math.pow(dx ** 2 + dy ** 2, 0.5);

        var totalCount = Math.max(1, Math.round(dz));
        var ddx = dx / totalCount;
        var ddy = dy / totalCount;

        for (let i = 0; i < totalCount; i += 0.5) {
            var px = Math.floor(x1 + ddx * i);
            var py = Math.floor(y1 + ddy * i);
            if (isRightMouseClicked()) {
                doBrushFunc(px, py, (x, y) => removeSquarePos(x, y));
            } else {
                if (loadUI(UI_SM_BB)) {
                    let mode = loadUI(UI_BB_MODE);
                    if (mode == UI_MODE_SOIL) {
                        doBrushFunc(px, py, (x, y) => addSquareByName(x, y, "soil"));
                    } else if (mode == UI_MODE_ROCK) {
                        doBrushFunc(px, py, (x, y) => addSquareByName(x, y, "rock"));
                    }
                }
                if (loadUI(UI_SM_SPECIAL)) {
                    let mode = loadUI(UI_SPECIAL_SELECT);
                    if (mode == UI_SPECIAL_WATER) {
                        doBrushFunc(px, py, (x, y) => addSquareByName(x, y, "water"));
                    } else if (mode == UI_SPECIAL_AQUIFER) {
                        addSquareByName(px, py, "aquifer")
                    } else if (mode == UI_SPECIAL_SURFACE) {
                        saveUI(UI_SM_VIEWMODE, true);
                        saveUI(UI_VIEWMODE_SELECT, UI_VIEWMODE_SURFACE);
                        doBrushFunc(px, py, (x, y) => getSquares(x, y)
                            .filter((sq) => sq.solid && sq.collision)
                            .forEach((sq) => sq.surface = !isRightMouseClicked()));
                    } else if (mode == UI_SPECIAL_MIX) {
                        doBlockBlur(px, py, loadUI(UI_BB_SIZE));
                    }
                }
                if (loadUI(UI_SM_ORGANISM)) {
                    var selectedOrganism = loadUI(UI_ORGANISM_SELECT);
                    switch (selectedOrganism) {
                        case "wheat":
                            var chance = Math.random();
                            if (chance > 0.9) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    var orgAdded = addNewOrganism(new WheatSeedOrganism(sq));
                                    if (!orgAdded) {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }
    } else {
        doBlockHover(lastMoveOffset);
    }
    prevManipulationOffset = lastMoveOffset;
}

function doBlockHover(lastMoveOffset) {
    var offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
    var offsetX = offsetTransformed[0];
    var offsetY = offsetTransformed[1];
    eyedropperBlockHover(offsetX, offsetY);
}