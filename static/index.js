import { BaseSquare } from "./squares/BaseSqaure.js";
import {
    global_plantToRealWaterConversionFactor,
    b_sq_waterContainmentMax,
    b_sq_nutrientValue,
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
    drain_sq_waterContainmentMax,
    drain_sq_waterTransferRate,
    wds_sq_waterContainmentMax,
    wds_sq_waterContainmentTransferRate,
    b_sq_waterContainmentTransferRate,
    b_sq_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
    d_sq_nutrientValue,
    rain_dropChance,
    heavyrain_dropChance,
    rain_dropHealth,
    water_evaporationRate,
    water_viscocity,
    water_darkeningStrength,
    po_airSuckFrac,
    po_waterSuckFrac,
    po_rootSuckFrac,
    po_perFrameCostFracPerSquare,
    po_greenSquareSizeExponentCost,
    po_rootSquareSizeExponentCost,
    p_ls_airNutrientsPerExposedNeighborTick,
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_neighborWaterContainmentRequiredToDecay,
    p_seed_ls_darkeningStrength
    } from "./config/config.js"

import { addSquareOverride, getDirectNeighbors, getNeighbors } from "./squares/_sqOperations.js";
import { Law } from "./Law.js";

var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');
var materialSelect = document.getElementById("materialSelect");
var fastTerrain = document.getElementById("fastTerrain");
var loadSlotA = document.getElementById("loadSlotA");
var saveSlotA = document.getElementById("saveSlotA");
var loadSlotB = document.getElementById("loadSlotB");
var saveSlotB = document.getElementById("saveSlotB");

var selectedMaterial = "dirt";

materialSelect.addEventListener('change', (e) => selectedMaterial = e.target.value);
timeScale.addEventListener('change', (e) => TIME_SCALE = e.target.value);
MAIN_CANVAS.addEventListener('mousemove', handleClick, false);

var mouseDown = 0;
var organismAddedThisClick = false;
var lastClickEvent = null;
var lastTick = Date.now();

document.body.onmousedown = function () {
    mouseDown = 1;
}
document.body.onmouseup = function () {
    mouseDown = 0;
    organismAddedThisClick = false;
}

// each square is 16x16
// 'little guys' may aquire multiple squares
var TIME_SCALE = 1;
const BASE_SIZE = 8;
var MILLIS_PER_TICK = 1;
var CANVAS_SQUARES_X = 120; // * 8; //6;
var CANVAS_SQUARES_Y = 80; // * 8; // 8;
var ERASE_RADIUS = 2;
var lastLastClickEvent = null;
var curEntitySpawnedId = 0;

MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

var stats = new Map();
var statsLastUpdatedTime = 0;
var NUM_GROUPS = 0;
var ALL_SQUARES = new Map();
var ALL_ORGANISMS = new Map();
var ALL_ORGANISM_SQUARES = new Map();

var WATERFLOW_TARGET_SQUARES = new Map();
var WATERFLOW_CANDIDATE_SQUARES = new Set();

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

// function loadOrganismsFromOrgMap(sourceOrgMap) {
//     var rootKeys = Object.keys(sourceOrgMap);
//     for (let i = 0; i < rootKeys.length; i++) {
//         var subObj = sourceOrgMap[rootKeys[i]];
//         if (subObj != null) {
//             var subKeys = Object.keys(subObj);
//             for (let j = 0; j < subKeys.length; j++) {
//                 sourceObjMap[rootKeys[i]][subKeys[j]].forEach((org) => {
//                     var orgAsOrganism = Object.setPrototypeOf(org, ProtoMap[org.proto]);
//                     for (let i = 0; i < orgAsOrganism.associatedSquares.length; i++) {
//                         var sq = orgAsOrganism.associatedSquares[i];
//                         sq = Object.setPrototypeOf(sq, ProtoMap[org.proto]);
//                         if (sq.linkedSquare != null) {

//                         }
//                     }
//             }
//         }
//     }
// }


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

    ALL_SQUARES = new Map();
    ALL_ORGANISMS = new Array();
    ALL_ORGANISM_SQUARES = new Map();

    loadObjArr(loaded_ALL_SQUARES, addSquare)

    // var rootKeys = Object.keys(loaded_ALL_SQUARES);
    // for (let i = 0; i < rootKeys.length; i++) {
    //     var subKeys = Object.keys(loaded_ALL_SQUARES[rootKeys[i]]);
    //     for (let j = 0; j < subKeys.length; j++) {
    //         loaded_ALL_SQUARES[rootKeys[i]][subKeys[j]].forEach((sq) => addSquare(Object.setPrototypeOf(sq, ProtoMap[sq.proto])));
    //     }
    // }


    // rootKeys = Object.keys(loaded_ALL_ORGANISM_SQUARES);
    // for (let i = 0; i < rootKeys.length; i++) {
    //     var subKeys = Object.keys(loaded_ALL_ORGANISM_SQUARES[rootKeys[i]]);
    //     for (let j = 0; j < subKeys.length; j++) {
    //         var squares = loaded_ALL_ORGANISM_SQUARES[rootKeys[i]][subKeys[j]];
    //         for (let k = 0; k < squares.length; k++) {
    //             var sq = squares[k];
    //             if (sq != null) {
    //                 addOrganismSquare(Object.setPrototypeOf(sq, ProtoMap[sq.proto]));
    //             }
    //         }
    //     }
    // }

    // for (let i = 0; i < loaded_ALL_ORGANISMS.length; i++) {
    //     var org = loaded_ALL_ORGANISMS[i];
    //     Object.setPrototypeOf(org, ProtoMap[org.proto]);
    //     var orgAssociatedSquares = new Array();
    //     Object.setPrototypeOf(org.law, Law.prototype);
    //     org.associatedSquares.forEach(
    //         (orgSq) => orgAssociatedSquares.push(
    //             getOrganismSquaresAtSquareOfProto(orgSq.posX, orgSq.posY, orgSq.proto)
    //         ));
    //     org.associatedSquares = Array.from(orgAssociatedSquares.filter((x) => x != null));
    //     addOrganism(org);
    // }
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

function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
        doClickAdd();
        reset();
        physicsBefore();
        physics();
        doWaterFlow();
        purge();
        render();
        processOrganisms();
        renderOrganisms();
        lastTick = Date.now();
    }

    setTimeout(main, 5);
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
                        case "static":
                            addSquareOverride(new StaticSquare(px, curY));
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
                            if (sq != null) {
                                var newOrg = new PlantSeedOrganism(px, curY);
                                newOrg.linkedSquare = sq;
                                organismAddedThisClick = true;
                                addOrganism(newOrg);
                            }
                            break;
                    }
                }
                if (!fastTerrain.checked || selectedMaterial.indexOf("rain") >= 0) {
                    break;
                }
            }
        }
        lastLastClickEvent = lastClickEvent;
    }
}

// thanks https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new StaticSquare(i, CANVAS_SQUARES_Y - 1));
}

for (let i = 0; i < CANVAS_SQUARES_Y; i++) {
    addSquare(new StaticSquare(CANVAS_SQUARES_X - 1, i));
    addSquare(new StaticSquare(0, i));
}
window.oncontextmenu = function () {
    return false;     // cancel default menu
}
main()