import { BaseSquare } from "./squares/BaseSqaure.js";
import { getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares } from "./squares/_sqOperations.js";
import { purge, reset, render, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow } from "./globalOperations.js"
import { RockSquare } from "./squares/RockSquare.js"
import { DirtSquare } from "./squares/DirtSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { RainSquare } from "./squares/RainSquare.js";
import { HeavyRainSquare } from "./squares/RainSquare.js";
import { AquiferSquare } from "./squares/RainSquare.js";
import { WaterDistributionSquare } from "./squares/WaterDistributionSquare.js";
import { DrainSquare } from "./squares/DrainSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { PlantSeedOrganism } from "./organisms/PlantSeedOrganism.js";
import { addNewOrganism, addOrganism } from "./organisms/_orgOperations.js";
import { organismMetadataViewerMain } from "./organismMetadataViewer.js";

import { updateTime, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, ALL_SQUARES, getNextEntitySpawnId } from "./globals.js";

import { doErase } from "./manipulation.js";
import { ProtoMap } from "./types.js";

var materialSelect = document.getElementById("materialSelect");
var fastTerrain = document.getElementById("fastTerrain");
var loadSlotA = document.getElementById("loadSlotA");
var saveSlotA = document.getElementById("saveSlotA");
var loadSlotB = document.getElementById("loadSlotB");
var saveSlotB = document.getElementById("saveSlotB");

var selectedMaterial = "dirt";
const BASE_SIZE = 12;

materialSelect.addEventListener('change', (e) => selectedMaterial = e.target.value);
timeScale.addEventListener('change', (e) => TIME_SCALE = e.target.value);

var mouseDown = 0;
var organismAddedThisClick = false;
var lastClickEvent = null;
var lastTick = Date.now();

var CANVAS_SQUARES_X = 170; // * 8; //6;
var CANVAS_SQUARES_Y = 50 + 5; // * 8; // 8;

var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');
MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

MAIN_CANVAS.addEventListener('mousemove', handleClick, false);

document.body.onmousedown = function () {
    mouseDown = 1;
}
document.body.onmouseup = function () {
    mouseDown = 0;
    organismAddedThisClick = false;
}

var shiftPressed = false;

var TIME_SCALE = 1;
var MILLIS_PER_TICK = 1;

var lastLastClickEvent = null;
var rightMouseClicked = false;

loadSlotA.onclick = (e) => loadSlot("A");
saveSlotA.onclick = (e) => saveSlot("A");
loadSlotB.onclick = (e) => loadSlot("B");
saveSlotB.onclick = (e) => saveSlot("B");

function loadObjArr(sourceObjMap, addFunc) {
    var rootKeys = Object.keys(sourceObjMap);
    for (let i = 0; i < rootKeys.length; i++) {
        var subObj = sourceObjMap[rootKeys[i]];
        if (subObj != null) {
            var subKeys = Object.keys(subObj);
            for (let j = 0; j < subKeys.length; j++) {
                sourceObjMap[rootKeys[i]][subKeys[j]].forEach((obj) => addFunc(Object.setPrototypeOf(obj, ProtoMap[obj.proto])));
            }
        }
    }
}

function loadSlot(slotName) {
    var sqLoad = localStorage.getItem("ALL_SQUARES_" + slotName);
    if (sqLoad == null) {
        alert("no data to load!!! beep boop :(")
        return null;
    }
    // These are not our 'real' objects - they are JSON objects.
    // So they don't have functions and such. 
    var loaded_ALL_SQUARES = JSON.parse(localStorage.getItem("ALL_SQUARES_" + slotName));
    var loaded_ALL_ORGANISMS = JSON.parse(localStorage.getItem("ALL_ORGANISMS_" + slotName));
    var loaded_ALL_ORGANISM_SQUARES = JSON.parse(localStorage.getItem("ALL_ORGANISM_SQUARES_" + slotName));

    // bippity boppity do something like this 
    // Object.setPrototypeOf(sq, DirtSquare.prototype)

    ALL_SQUARES.clear();
    ALL_ORGANISMS.clear();
    ALL_ORGANISM_SQUARES.clear();

    loadObjArr(loaded_ALL_SQUARES, addSquare)
}

function saveSlot(slotName) {
    localStorage.setItem("ALL_SQUARES_" + slotName, JSON.stringify(ALL_SQUARES));
    localStorage.setItem("ALL_ORGANISMS_" + slotName, JSON.stringify(ALL_ORGANISMS));
    localStorage.setItem("ALL_ORGANISM_SQUARES_" + slotName, JSON.stringify(ALL_ORGANISM_SQUARES));
}


function handleMouseDown(e) {
    //e.button describes the mouse button that was clicked
    // 0 is left, 1 is middle, 2 is right
    if (e.button === 2) {
        rightMouseClicked = true;
    } else if (e.button === 0) {
        //Do something if left button was clicked and right button is still pressed
        if (rightMouseClicked) {
            console.log('hello');
            //code
        }
    }
}

function handleMouseUp(e) {
    if (e.button === 2) {
        rightMouseClicked = false;
    }
}

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
        doClickAdd();
        reset();

        render();

        physicsBefore();
        physics();
        doWaterFlow();
        purge();
        processOrganisms();
        renderOrganisms();
        lastTick = Date.now();
    }
    updateTime();
    setTimeout(main, 5);
    organismMetadataViewerMain();
}


function handleClick(event) {
    lastClickEvent = event;
    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastClickEvent = event;
    }
}

function doClickAdd() {
    if (lastClickEvent == null) {
        return;
    }
    if (mouseDown > 0) {
        var offsetX = lastClickEvent.offsetX / BASE_SIZE;
        var offsetY = lastClickEvent.offsetY / BASE_SIZE;
        var prevOffsetX = (lastLastClickEvent == null ? lastClickEvent : lastLastClickEvent).offsetX / BASE_SIZE;
        var prevOffsetY = (lastLastClickEvent == null ? lastClickEvent : lastLastClickEvent).offsetY / BASE_SIZE;

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
            var px = x1 + ddx * i;
            var py = y1 + ddy * i;
            for (let i = 0; i < (CANVAS_SQUARES_Y - offsetY); i++) {
                var curY = py + i;
                if (rightMouseClicked) {
                    doErase(px, curY);
                    break;
                } else {
                    switch (selectedMaterial) {
                        case "rock":
                            addSquareOverride(new RockSquare(px, curY));
                            break;
                        case "dirt":
                            addSquareOverride(new DirtSquare(px, curY));
                            break;
                        case "water":
                            addSquare(new WaterSquare(px, curY));
                            break;
                        case "rain":
                            addSquareOverride(new RainSquare(px, curY));
                            break;
                        case "heavy rain":
                            addSquareOverride(new HeavyRainSquare(px, curY));
                            break;
                        case "water distribution":
                            addSquareOverride(new WaterDistributionSquare(px, curY));
                            break;
                        case "drain":
                            addSquareOverride(new DrainSquare(px, curY));
                            break;
                        case "aquifer":
                            addSquareOverride(new AquiferSquare(px, curY));
                            break;

                        // organism sections
                        // in this case we only want to add one per click
                        case "plant":
                            if (organismAddedThisClick) {
                                break;
                            }
                            var sq = addSquare(new SeedSquare(px, curY));
                            if (sq) {
                                organismAddedThisClick = true;
                                addNewOrganism(new PlantSeedOrganism(sq));
                            }
                            break;
                    }
                }
                if (!shiftPressed || selectedMaterial.indexOf("rain") >= 0 || selectedMaterial.indexOf("aquifer") >= 0 ) {
                    break;
                }
            }
        }
        lastLastClickEvent = lastClickEvent;
    }
}

// thanks https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
}

for (let i = 0; i < CANVAS_SQUARES_Y; i++) {
    addSquare(new RockSquare(CANVAS_SQUARES_X - 1, i));
    addSquare(new RockSquare(0, i));
}
window.oncontextmenu = function () {
    return false;     // cancel default menu
}
main()


window.onload = function() {
    document.addEventListener('keydown', function(e) {
        if (e.code === "ShiftLeft") {
            shiftPressed = true;
        }
    }, false);

    document.addEventListener('keyup', function(e) {
        if (e.code === "ShiftLeft") {
            shiftPressed = false;
        }
    }, false);

    
    // document.addEventListener('keyup', (e) => {
    //     if (e.code === "Shift") {
    //         shiftPressed = false;
    //     }
    // });
}

export { MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE }