var ERASE_RADIUS = 2;

import { getLastMoveOffset } from "./index.js";
import { isLeftMouseClicked } from "./mouse.js";
import { removeSquarePos } from "./squares/_sqOperations.js";
import { isWindowHovered } from "./ui/WindowManager.js";

var prevManipulationOffset;

function doBlockBlur(centerX, centerY) {
    if (Math.random() > 0.5) {
        return;
    }
    var rx = randNumber(-brushSizeSlider_val / 2,brushSizeSlider_val / 2);
    var ry = randNumber(-brushSizeSlider_val / 2,brushSizeSlider_val / 2);
    var len = ((rx ** 2) + (ry ** 2)) ** 0.5;

    if (len > brushSizeSlider_val) {
        rx /= (brushSizeSlider_val / len);
        ry /= (brushSizeSlider_val / len);
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
    if (lastMode == "special" && specialSelect_val != "water") {
        func(centerX, centerY);
        return;
    }
    for (var i = -radius; i < radius; i++) {
        for (var j = -radius; j < radius; j++) {
            if (Math.abs(i) + Math.abs(j) + 2 > (radius ** 2 + radius ** 2) ** 0.5) {
                continue;
            }
            func(centerX + i, centerY + j);
        }
    }
}

function addSquareByName(posX, posY, name) {
    var square; 
    switch (name) {
        case "rock":
            square = addSquareOverride(new RockSquare(posX, posY));
            break;
        case "soil":
            square = addSoilSquare(posX, posY, name);
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
    if (lastMoveOffset == null || middleMouseClicked || isWindowHovered()) {
        return;
    }

    triggerEarlySquareScheduler(); 

    if (isLeftMouseClicked > 0) {
        if (lastMoveOffset.x > CANVAS_SQUARES_X * BASE_SIZE || lastMoveOffset > CANVAS_SQUARES_Y * BASE_SIZE) {
            return;
        }
        var offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
        var offsetX = offsetTransformed[0];
        var offsetY = offsetTransformed[1];

        var prevOffsetX;
        var prevOffsetY;

        if (prevManipulationOffset == null) {
            prevOffsetX = offsetX;
            prevOffsetY = offsetY;
        } else {
            var prevOffsets =  transformPixelsToCanvasSquares(prevManipulationOffset.x, prevManipulationOffset.y);
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
            if (rightMouseClicked && (lastMode == "normal" || lastMode == "special")) {
                doBrushFunc(px, py, (x, y) => removeSquarePos(x, y));
            } else {
                if (lastMode == "normal" || lastMode == "special") {
                    doBrushFunc(px, py, (x, y) => addSquareByNameConfig(x, y));
                } else if (lastMode == "blockModification") {
                    doBrushFunc(px, py, (x, y) => doBlockMod(x, y));
                } else if (lastMode.startsWith("organism")) {
                    var selectedOrganism;
                    if (lastMode == "organismWetland") {
                        selectedOrganism = organismWetland_val;
                    } else if (lastMode == "organismOther") {
                        selectedOrganism = organismOther_val;
                    }
                    switch (selectedOrganism) {
                        // organism sections
                        // in this case we only want to add one per click
                        case "PalmTree":
                            if (organismAddedThisClick) {
                                return;
                            }
                            var sq = addSquare(new SeedSquare(px, py));
                            if (sq) {
                                addNewOrganism(new PalmTreeSeedOrganism(sq));
                                organismAddedThisClick = true;
                            }
                            break;

                        case "ElephantEar":
                            if (organismAddedThisClick) {
                                return;
                            }
                            var sq = addSquare(new SeedSquare(px, py));
                            if (sq) {
                                addNewOrganism(new ElephantEarSeedOrganism(sq));
                                organismAddedThisClick = true;
                            }
                            break;

                        case "Wheat":
                            var chance = Math.random();
                            if (!organismAddedThisClick) {
                                chance = 1;
                            }
                            if (chance > 0.9) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    var org = addNewOrganism(new WheatSeedOrganism(sq));
                                    if (org) {
                                        organismAddedThisClick = true;
                                    } else {
                                        sq.destroy();
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }
        prevManipulationOffset = lastMoveOffset;
    }

}
