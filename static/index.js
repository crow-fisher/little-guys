import { BaseSquare } from "./squares/BaseSqaure.js";
import { getNeighbors, getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, removeSquarePos } from "./squares/_sqOperations.js";
import { purge, reset, renderWater, renderSquares, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquare } from "./globalOperations.js"
import { RockSquare } from "./squares/RockSquare.js"
import { DirtSquare } from "./squares/DirtSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { RainSquare } from "./squares/RainSquare.js";
import { HeavyRainSquare } from "./squares/RainSquare.js";
import { AquiferSquare } from "./squares/RainSquare.js";
import { WaterDistributionSquare } from "./squares/WaterDistributionSquare.js";
import { DrainSquare } from "./squares/DrainSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { PopGrassSeedOrganism } from "./organisms/PopGrassSeedOrganism.js";
import { addNewOrganism, addOrganism, iterateOnOrganisms } from "./organisms/_orgOperations.js";

import { ALL_ORGANISMS, ALL_ORGANISM_SQUARES, ALL_SQUARES, getNextEntitySpawnId } from "./globals.js";
import { getCurDay, getCurTime, updateTime, renderTime } from "./time.js";

import { doErase } from "./manipulation.js";
import { ProtoMap } from "./types.js";
import { GravelSquare } from "./squares/GravelSquare.js";
import { SandSquare } from "./squares/SandSquare.js";
import { getOrganismSquaresAtSquare } from "./lifeSquares/_lsOperations.js";
import { CactusSeedOrganism } from "./organisms/CactusSeedOrganism.js";
import { LilyPadSeedOrganism } from "./organisms/LilyPadSeedOrganism.js";
import { MossSeedOrganism } from "./organisms/MossSeedOrganism.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { randNumber } from "./common.js";
import { volcano } from "./saves.js";
import { HydrangeaSeedOrganism } from "./organisms/HydrangeaSeedOrganism.js";
import { MossCoolSeedOrganism } from "./organisms/MossCoolSeedOrganism.js";
import { SunflowerSeedOrganism } from "./organisms/SunflowerSeedOrganism.js";
import { clearPrevailingWind, addPrevailingWind, addWindPressure, initializeWindPressureMap, removeWindPressure, renderWindPressureMap, tickWindPressureMap } from "./wind.js";
import { renderTemperature, renderWaterSaturation, tickMaps, addTemperature, addWaterSaturation, renderClouds, addWaterSaturationPascals, addWaterSaturationPascalsSqCoords } from "./temperature_humidity.js";
import { PalmTreeSeedOrganism } from "./organisms/parameterized/tropical/PalmTreeSeedOrganism.js";
import { ElephantEarSeedOrganism } from "./organisms/parameterized/tropical/ElephantEarSeedOrganism.js";

var lastMode = "organism"; // options: "normal", "special", "organism", "blockModification";

var specialSelect = document.getElementById("specialSelect");
var specialSelect_val = "water";
var material1 = document.getElementById("material1");
var material1_val = "dirt";
var material2 = document.getElementById("material2");
var material2_val = "sand";
var mixMaterials = document.getElementById("mixMaterials");
var mixMaterials_val = true;
var materialSlider = document.getElementById("materialSlider");
var materialSlider_val = 0;
var newBlockTemperature = document.getElementById("newBlockTemperature");
var newBlockTemperature_val = 273 + 20;
var lockTemperature = document.getElementById("lockTemperature");
var lockTemperature_val = false;

var brushStrengthSlider = document.getElementById("brushStrengthSlider");
var brushStrengthSlider_val = 100;

var brushSizeSlider = document.getElementById("brushSizeSlider");
var brushSizeSlider_val = 3;

var organismWetland = document.getElementById("organismWetland");
var organismWetland_val;
var organismOther = document.getElementById("organismOther");
var organismOther_val;
var blockModification = document.getElementById("blockModification");
var blockModification_val;

var mainControlTable = document.getElementById("mainControlTable");
var secondaryControlTable = document.getElementById("secondaryControlTable");
var specialHeader = document.getElementById("specialHeader");
var specialHeader_ref = "special"
var normalHeader = document.getElementById("normalHeader");
var normalHeader_ref = "normal"
var orgWetlandHeader = document.getElementById("orgWetlandHeader");
var orgWetlandHeader_ref = "organismWetland"
var orgOtherHeader = document.getElementById("orgOtherHeader");
var orgOtherHeader_ref = "organismOther"
var blockModificationHeader = document.getElementById("blockModificationHeader");
var blockModificationHeader_ref = "blockModification";

var canvasWidth = document.getElementById("canvasWidth");
var canvasHeight = document.getElementById("canvasHeight");

var timeScale = document.getElementById("timeScale");
var viewmodeSelect = document.getElementById("viewmodeSelect");

var loadSlotA = document.getElementById("loadSlotA");
var saveSlotA = document.getElementById("saveSlotA");
var loadSlotB = document.getElementById("loadSlotB");
var saveSlotB = document.getElementById("saveSlotB");
var loadSlotC = document.getElementById("loadSlotC");
var saveSlotC = document.getElementById("saveSlotC");

var loadSlotVolcano = document.getElementById("loadSlotVolcano");
var loadSlotValley = document.getElementById("loadSlotValley");

var selectedMaterial = "dirt";
var selectedViewMode = "normal";
var global_theta_base = 0;
const BASE_SIZE = 4;


function getNewBlockTemperatureVal() {
    return newBlockTemperature_val;
}

function getNewBlockLockedTemperature() {
    return lockTemperature_val;
}





function styleHeader() {
    var nonbold_headers = [
        specialHeader,
        normalHeader,
        orgWetlandHeader,
        orgOtherHeader,
        blockModificationHeader
    ]
    var bold_headers = [];
    if (lastMode == specialHeader_ref) {
        nonbold_headers = Array.from(nonbold_headers.filter((v) => v != specialHeader));
        bold_headers.push(specialHeader);
    }
    if (lastMode == normalHeader_ref) {
        nonbold_headers = Array.from(nonbold_headers.filter((v) => v != normalHeader));
        bold_headers.push(normalHeader);
    }
    if (lastMode == orgWetlandHeader_ref) {
        nonbold_headers = Array.from(nonbold_headers.filter((v) => v != orgWetlandHeader));
        bold_headers.push(orgWetlandHeader);
    }
    if (lastMode == orgOtherHeader_ref) {
        nonbold_headers = Array.from(nonbold_headers.filter((v) => v != orgOtherHeader));
        bold_headers.push(orgOtherHeader);
    }
    if (lastMode == blockModificationHeader_ref) {
        nonbold_headers = Array.from(nonbold_headers.filter((v) => v != blockModificationHeader));
        bold_headers.push(blockModificationHeader);
    }

    nonbold_headers.forEach((header) => header.classList = "nonselected");
    bold_headers.forEach((header) => header.classList = "selected");
}

styleHeader();

specialSelect.addEventListener('change', (e) => {
    lastMode = "special";
    styleHeader();
    specialSelect_val = e.target.value;
});
material1.addEventListener('change', (e) => {
    lastMode = "normal";
    styleHeader();
    material1_val = e.target.value;
});
material2.addEventListener('change', (e) => {
    lastMode = "normal";
    styleHeader();
    material2_val = e.target.value;
});
mixMaterials.addEventListener('change', (e) => {
    lastMode = "normal";
    styleHeader();
    mixMaterials_val = e.target.checked;
});
materialSlider.addEventListener('change', (e) => {
    lastMode = "normal";
    styleHeader();
    materialSlider_val = parseInt(e.target.value);
});
newBlockTemperature.addEventListener('change', (e) => {
    styleHeader();
    newBlockTemperature_val = 273 + parseInt(e.target.value);
});
lockTemperature.addEventListener('change', (e) => {
    styleHeader();
    lockTemperature_val = e.target.checked;
});
organismWetland.addEventListener('change', (e) => {
    lastMode = "organismWetland";
    styleHeader();
    organismWetland_val = e.target.value;
});
organismOther.addEventListener('change', (e) => {
    lastMode = "organismOther";
    styleHeader();
    organismOther_val = e.target.value;
});
blockModification.addEventListener('change', (e) => {
    lastMode = "blockModification";
    styleHeader();
    blockModification_val = e.target.value;
});
brushStrengthSlider.addEventListener('change', (e) => {
    lastMode = "normal";
    styleHeader();
    brushStrengthSlider_val = e.target.value;
});
brushSizeSlider.addEventListener('change', (e) => {
    brushSizeSlider_val = e.target.value;
});

viewmodeSelect.addEventListener('change', (e) => selectedViewMode = e.target.value);
timeScale.addEventListener("change", (e) => TIME_SCALE = e.target.value)

canvasWidth.addEventListener('change', (e) => setCanvasSquaresX(e.target.value));
canvasHeight.addEventListener('change', (e) => setCanvasSquaresY(e.target.value));

var mouseDown = 0;
var organismAddedThisClick = false;
var lastMoveEvent = null;
var lastMoveOffset = null;
var lastLastMoveOffset = null;

var lastTick = Date.now();

// wind is tiled x4

var CANVAS_SQUARES_X = 60 * 4; // * 8; //6;
var CANVAS_SQUARES_Y = 30 * 4; // * 8; // 8;



function setCanvasSquaresX(val) {
    CANVAS_SQUARES_X = Math.floor(val);
    MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
    MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;
    mainControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    secondaryControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
    }
}

function getCanvasSquaresX() {
    return CANVAS_SQUARES_X;
}

function setCanvasSquaresY(val) {
    CANVAS_SQUARES_Y = Math.floor(val);
    MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
    MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;
    mainControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    secondaryControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
    }
}
function getCanvasSquaresY() {
    return CANVAS_SQUARES_Y;
}

// these numbers go up to the full window width
var CANVAS_VIEWPORT_CENTER_X = CANVAS_SQUARES_X * BASE_SIZE / 2;
var CANVAS_VIEWPORT_CENTER_Y = CANVAS_SQUARES_Y * BASE_SIZE / 2;

var CANVAS_SQUARES_ZOOM = 1; // higher is farther in. 1/n etc etc 

function transformPixelsToCanvasSquares(x, y) {
    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    var windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    var canvasWindowWidth = CANVAS_SQUARES_X / CANVAS_SQUARES_ZOOM;
    var canvasWindowHeight = CANVAS_SQUARES_Y / CANVAS_SQUARES_ZOOM;
    
    var windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    var windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    var canvasWindowWidthStart = windowWidthStart /   BASE_SIZE;
    var canvasWindowHeightStart = windowHeightStart / BASE_SIZE;

    var xpi = x / totalWidth;
    var ypi = y / totalHeight;

    return [canvasWindowWidthStart + xpi * canvasWindowWidth, canvasWindowHeightStart + ypi * canvasWindowHeight];
}

function zoomCanvasFillRect(x, y, dx, dy) {
    dx *= CANVAS_SQUARES_ZOOM;
    dy *= CANVAS_SQUARES_ZOOM;

    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var windowWidth = totalWidth / CANVAS_SQUARES_ZOOM;
    var windowHeight = totalHeight / CANVAS_SQUARES_ZOOM;

    var windowWidthStart = CANVAS_VIEWPORT_CENTER_X - (windowWidth / 2);
    var windowHeightStart = CANVAS_VIEWPORT_CENTER_Y - (windowHeight / 2); 

    var windowWidthEnd = CANVAS_VIEWPORT_CENTER_X + (windowWidth / 2);
    var windowHeightEnd = CANVAS_VIEWPORT_CENTER_Y + (windowHeight / 2); 

    if (x == 0 && y == 0) {
        x = windowWidthStart;
        y = windowHeightStart;
    }

    if (x < windowWidthStart || x > windowWidthEnd) {
        return;
    }

    if (y < windowHeightStart || y > windowHeightEnd) {
        return;
    }

    var xpi = (x - windowWidthStart) / (windowWidthEnd - windowWidthStart);
    var ypi = (y - windowHeightStart) / (windowHeightEnd - windowHeightStart);

    var xpl = xpi * totalWidth;
    var ypl = ypi * totalHeight;
    
    MAIN_CONTEXT.fillRect(
        xpl, 
        ypl,
        dx,
        dy
    );
}


function zoom(event) {
    event.preventDefault();

    var totalWidth = CANVAS_SQUARES_X * BASE_SIZE;
    var totalHeight = CANVAS_SQUARES_Y * BASE_SIZE;

    var canvasPos = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);

    var lsqFound = false;
    iterateOnOrganisms((org) => org.lifeSquares.filter((lsq) => lsq.component != null)
        .forEach((lsq) => {
        var lsqx = lsq.posX - (lsq.deflectionXOffset * Math.sin(lsq.component.getTheta()) + lsq.xOffset);
        var lsqy = lsq.posY - (lsq.deflectionYOffset + lsq.yOffset);
        var dist = ((1 + canvasPos[0] - lsqx) ** 2 + (1 + canvasPos[1] - lsqy) ** 2) ** 0.5;
        if (dist < 5) {
            lsq.component.theta += event.deltaY * 0.0001;
            lsqFound = true;
        }
    }), 0);
    if (lsqFound) {
        return;
    }

    var x = 1 - lastMoveOffset.x / totalWidth;
    var y = 1 - lastMoveOffset.y / totalHeight;
    var startZoom = CANVAS_SQUARES_ZOOM;
    CANVAS_SQUARES_ZOOM = Math.min(Math.max(CANVAS_SQUARES_ZOOM + event.deltaY * -0.001, 1), 100);
    var endZoom = CANVAS_SQUARES_ZOOM;

    var startWidth = totalWidth / startZoom;
    var endWidth = totalWidth / endZoom;

    var startHeight = totalHeight / startZoom;
    var endHeight = totalHeight / endZoom;

    var widthDiff = endWidth - startWidth;
    var heightDiff = endHeight - startHeight;

    CANVAS_VIEWPORT_CENTER_X += (widthDiff * (x - 0.5));
    CANVAS_VIEWPORT_CENTER_Y += (heightDiff * (y - 0.5));
}


mainControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
secondaryControlTable.setAttribute("width", CANVAS_SQUARES_X * BASE_SIZE);
// var CANVAS_SQUARES_X = 40;
// var CANVAS_SQUARES_Y = 40;

var MAIN_CANVAS = document.getElementById("main");
var MAIN_CONTEXT = MAIN_CANVAS.getContext('2d');
MAIN_CANVAS.width = CANVAS_SQUARES_X * BASE_SIZE;
MAIN_CANVAS.height = CANVAS_SQUARES_Y * BASE_SIZE;

MAIN_CANVAS.onwheel = zoom;
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

var rightMouseClicked = false;
var middleMouseClicked = false;

loadSlotA.onclick = (e) => loadSlot("A");
saveSlotA.onclick = (e) => saveSlot("A");
loadSlotB.onclick = (e) => loadSlot("B");
saveSlotB.onclick = (e) => saveSlot("B");
loadSlotC.onclick = (e) => loadSlot("C");
saveSlotC.onclick = (e) => saveSlot("C");

loadSlotVolcano.onclick = (e) => loadSlotFromSave(volcano);

function loadObjArr(sourceObjMap, addFunc) {
    iterateOnSquares((sq) => sq.destroy());
    var sqMaxPosY = 0;
    var rootKeys = Object.keys(sourceObjMap);
    for (let i = 0; i < rootKeys.length; i++) {
        var subObj = sourceObjMap[rootKeys[i]];
        if (subObj != null) {
            var subKeys = Object.keys(subObj);
            for (let j = 0; j < subKeys.length; j++) {
                sourceObjMap[rootKeys[i]][subKeys[j]].forEach((obj) => {
                    addFunc(Object.setPrototypeOf(obj, ProtoMap[obj.proto]));
                    sqMaxPosY = Math.max(sqMaxPosY, obj.posY);
                });
            }
        }
    }
    if (sqMaxPosY != CANVAS_SQUARES_Y) {
        iterateOnSquares((sq) => {
            removeSquare(sq);
            sq.posY += (CANVAS_SQUARES_Y - 1) - sqMaxPosY;
            addSquare(sq)
        }, 1);
    }

}

async function loadSlotFromSave(slotData) {
    const loaded_ALL_SQUARES = JSON.parse(await base64ToGzip(slotData));
    loadObjArr(loaded_ALL_SQUARES, addSquareOverride)
}

async function loadSlot(slotName) {
    var sqLoad = localStorage.getItem("ALL_SQUARES_" + slotName);
    if (sqLoad == null) {
        alert("no data to load!!! beep boop :(")
        return null;
    }
    // These are not our 'real' objects - they are JSON objects.
    // So they don't have functions and such. 
    const loaded_ALL_SQUARES = JSON.parse(await base64ToGzip(sqLoad));
    var loaded_ALL_ORGANISMS = JSON.parse(localStorage.getItem("ALL_ORGANISMS_" + slotName));
    var loaded_ALL_ORGANISM_SQUARES = JSON.parse(localStorage.getItem("ALL_ORGANISM_SQUARES_" + slotName));

    // bippity boppity do something like this 
    // Object.setPrototypeOf(sq, DirtSquare.prototype)

    loadObjArr(loaded_ALL_SQUARES, addSquareOverride)
}

async function saveSlot(slotName) {

    var anyOrganisms = false;
    iterateOnOrganisms((org) => anyOrganisms = true);

    if (anyOrganisms) {
        alert("saving not currently supported with organisms :(")
        return;
    }

    const compressedSquares = await gzipToBase64(JSON.stringify(ALL_SQUARES));
    localStorage.setItem("ALL_SQUARES_" + slotName, compressedSquares);
    // localStorage.setItem("ALL_ORGANISMS_" + slotName, JSON.stringify(ALL_ORGANISMS));
    // localStorage.setItem("ALL_ORGANISM_SQUARES_" + slotName, JSON.stringify(ALL_ORGANISM_SQUARES));
}

async function gzipToBase64(inputString) {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);

    const compressionStream = new CompressionStream("gzip");
    const writer = compressionStream.writable.getWriter();
    writer.write(data);
    writer.close();

    const compressedStream = compressionStream.readable;
    const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();
    const compressedUint8Array = new Uint8Array(compressedArrayBuffer);

    // Encode to Base64 in chunks
    let binaryString = '';
    for (let i = 0; i < compressedUint8Array.length; i++) {
        binaryString += String.fromCharCode(compressedUint8Array[i]);
    }

    return btoa(binaryString);
}

// Decode Base64 and gunzip
async function base64ToGzip(base64String) {
    const binaryString = atob(base64String);
    const compressedData = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));

    const decompressionStream = new DecompressionStream("gzip");
    const writer = decompressionStream.writable.getWriter();
    writer.write(compressedData);
    writer.close();

    const decompressedStream = decompressionStream.readable;
    const decompressedArrayBuffer = await new Response(decompressedStream).arrayBuffer();

    const decoder = new TextDecoder();
    return decoder.decode(decompressedArrayBuffer);
}


function handleMouseDown(e) {
    //e.button describes the mouse button that was clicked
    // 0 is left, 1 is middle, 2 is right
    e.preventDefault();
    if (e.button === 2) {
        rightMouseClicked = true;
    } else if (e.button === 0) {
        //Do something if left button was clicked and right button is still pressed
        if (rightMouseClicked) {
            console.log('hello');
            //code
        }
    } else if (e.button === 1) {
        CANVAS_VIEWPORT_CENTER_X = (CANVAS_SQUARES_X * BASE_SIZE) / 2;
        CANVAS_VIEWPORT_CENTER_Y = (CANVAS_SQUARES_Y * BASE_SIZE) / 2;
        CANVAS_SQUARES_ZOOM = 1;
        middleMouseClicked = true;
    }
}

function handleMouseUp(e) {
    if (e.button === 2) {
        rightMouseClicked = false;
    }
    if (e.button == 1) {
        middleMouseClicked = false;
    }
}

MAIN_CANVAS.addEventListener('mousedown', handleMouseDown);
MAIN_CANVAS.addEventListener('mouseup', handleMouseUp);
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});


function main() {
    if (Date.now() - lastTick > MILLIS_PER_TICK) {
        MAIN_CONTEXT.clearRect(0, 0, CANVAS_SQUARES_X * BASE_SIZE, CANVAS_SQUARES_Y * BASE_SIZE);
        doClickAdd();
        for (let i = 0; i < TIME_SCALE; i++) {
            reset();
            physicsBefore();
            physics();
            doWaterFlow();
            purge();
            processOrganisms();
            tickWindPressureMap();
            tickMaps();
            // global_theta_base += 0.1;
        }

        if (selectedViewMode == "temperature") {
            renderTemperature();
        }
        if (selectedViewMode == "wind" || (lastMode == "blockModification" && (blockModification_val == "windAdd" || blockModification_val == "windClear"))) {
            renderWindPressureMap();
        }
        if (selectedViewMode == "watersaturation") {
            renderWaterSaturation();
        }


        if (selectedViewMode == "normal") {
            renderTime();
        }
        renderSquares();
        renderOrganisms();
        renderWater();

        if (selectedViewMode == "normal") {
            renderClouds();
        }


        // if (blockModification_val != null && lastMode == "blockModification" && blockModification_val.startsWith("wind")) {
        //     renderWindPressureMap();
        // }
        // if (blockModification_val != null && lastMode == "blockModification" && blockModification_val.startsWith("temperature")) {
        //     renderTemperature();
        // }
        // if (blockModification_val != null && lastMode == "blockModification" && blockModification_val.startsWith("humidity")) {
        //     renderWaterSaturation();
        // }
        lastTick = Date.now();
    }
    updateTime();
    setTimeout(main, 5);
    doMouseHover();
}

initializeWindPressureMap();




function getOffset(evt) {
    if (evt.offsetX != undefined)
        return { x: evt.offsetX, y: evt.offsetY };

    var el = evt.target;
    var offset = { x: 0, y: 0 };

    while (el.offsetParent) {
        offset.x += el.offsetLeft;
        offset.y += el.offsetTop;
        el = el.offsetParent;
    }

    offset.x = evt.pageX - offset.x;
    offset.y = evt.pageY - offset.y;

    return offset;
}

function handleClick(event) {
    lastMoveEvent = event;
    lastMoveOffset = getOffset(event);

    if (!rightMouseClicked && mouseDown <= 0) {
        lastLastMoveOffset = lastMoveOffset;
    }
}

function doMouseHover() {
    if (lastMoveEvent == null) {
        return;
    }
    var px = lastMoveEvent.x / BASE_SIZE;
    var py = lastMoveEvent.y / BASE_SIZE;
    iterateOnOrganisms((org) => org.hovered = false);
    getOrganismSquaresAtSquare(Math.floor(px), Math.floor(py)).forEach((orgSq) => orgSq.linkedOrganism.hovered = true);
}

function addSquareByNameConfig(posX, posY) {
    var square = null;
    if (Math.random() * 100 < (100 - brushStrengthSlider_val)) {
        return;
    }
    if (lastMode == "special") {
        square = addSquareByNameSetTemp(posX, posY, specialSelect_val);
    } else {
        if (!mixMaterials_val) {
            square = addSquareByNameSetTemp(posX, posY, material1_val);
        }
        if (Math.random() * 100 > materialSlider_val) {
            square = addSquareByNameSetTemp(posX, posY, material1_val);
        } else {
            square = addSquareByNameSetTemp(posX, posY, material2_val);
        }
    }
}

function addSquareByNameSetTemp(posX, posY, name) {
    var square = addSquareByName(posX, posY, name);
    if (square && !square.organic) {
        square.temperature = getNewBlockTemperatureVal();
        if (getNewBlockLockedTemperature()) {
            square.thermalMass = 10 ** 8;
        }
    }
}

function addSquareByName(posX, posY, name) {
    var square; 
    switch (name) {
        case "rock":
            square = addSquareOverride(new RockSquare(posX, posY));
            break;
        case "dirt":
            square = addSquareOverride(new DirtSquare(posX, posY));
            break;
        case "water":
            square = addSquare(new WaterSquare(posX, posY));
            break;
        case "rain":
            square = addSquareOverride(new RainSquare(posX, posY));
            break;
        case "heavy rain":
            square = addSquareOverride(new HeavyRainSquare(posX, posY));
            break;
        case "water distribution":
            square = addSquareOverride(new WaterDistributionSquare(posX, posY));
            break;
        case "drain":
            square = addSquareOverride(new DrainSquare(posX, posY));
            break;
        case "aquifer":
            square = addSquare(new AquiferSquare(posX, posY));
            break;
        case "gravel":
            square = addSquareOverride(new GravelSquare(posX, posY));
            break;
        case "sand":
            square = addSquareOverride(new SandSquare(posX, posY));
            break;
    };
    return square;
}

function doBlockMod(posX, posY) {
    if (blockModification_val == "markSurface") {
        getSquares(posX, posY)
            .filter((sq) => sq.solid && sq.collision)
            .forEach((sq) => sq.surface = !rightMouseClicked);
        getDirectNeighbors(posX, posY)
            .filter((sq) => sq.solid && sq.collision)
            .forEach((sq) => sq.surface = !rightMouseClicked);
    }

    if (blockModification_val == "ligthenBlocks") {
        if (!rightMouseClicked) {
            getSquares(posX, posY)
                .forEach((sq) => sq.blockModDarkenVal = sq.blockModDarkenVal == null ? 0 : Math.min(sq.blockModDarkenVal + .01, 1));

            getDirectNeighbors(posX, posY)
                .forEach((sq) => sq.blockModDarkenVal = sq.blockModDarkenVal == null ? 0 : Math.min(sq.blockModDarkenVal + .005, 1));
        } else {
            getSquares(posX, posY)
                .forEach((sq) => sq.blockModDarkenVal = sq.blockModDarkenVal == null ? 0 : Math.max(sq.blockModDarkenVal - .01, -1));

            getDirectNeighbors(posX, posY)
                .forEach((sq) => sq.blockModDarkenVal = sq.blockModDarkenVal == null ? 0 : Math.max(sq.blockModDarkenVal - .005, -1));
        }
    }
    if (blockModification_val == "wind") {
        if (!rightMouseClicked)
            addWindPressure(posX, posY);
        else
            removeWindPressure(posX, posY);
    }
    if (blockModification_val == "windAdd") {
        if (!rightMouseClicked)
            addPrevailingWind(posX, posY, 1);
        else
            addPrevailingWind(posX, posY, -1);
    }
    if (blockModification_val == "windClear")
        clearPrevailingWind(posX, posY);

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

function getBlockModification_val() {
    if (lastMode == "blockModification")
        return blockModification_val;
    return "";
}

function doBrushFunc(centerX, centerY, func) {
    var workingRadius = brushSizeSlider_val * 2 + 1;

    if (lastMode == "special" && specialSelect_val != "water") {
        func(centerX, centerY);
        return;
    }
    var start = (workingRadius + 1) / 2;
    for (var i = -start; i < start; i++) {
        for (var j = -start; j < start; j++) {
            if (Math.abs(i) + Math.abs(j) + 2 > (start ** 2 + start ** 2) ** 0.5) {
                continue;
            }
            func(centerX + i, centerY + j);
        }
    }
}

function doClickAdd() {
    if (lastMoveEvent == null) {
        return;
    }
    if (middleMouseClicked) {
        return;
    }
    if (mouseDown > 0) {
        var offsetTransformed = transformPixelsToCanvasSquares(lastMoveOffset.x, lastMoveOffset.y);
        var offsetX = offsetTransformed[0];
        var offsetY = offsetTransformed[1];

        var prevOffsetX;
        var prevOffsetY;

        if (lastLastMoveOffset == null) {
            prevOffsetX = offsetX;
            prevOffsetY = offsetY;
        } else {
            var prevOffsets =  transformPixelsToCanvasSquares(lastLastMoveOffset.x, lastLastMoveOffset.y);
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
                        case "popgrass":
                            if (Math.random() > 0.95) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    // organismAddedThisClick = true;
                                    addNewOrganism(new PopGrassSeedOrganism(sq));
                                }
                            }
                            break;

                        case "cactus":
                            if (Math.random() > 0.95) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    addNewOrganism(new CactusSeedOrganism(sq));
                                }
                            }
                            break;

                        case "waterlily":
                            if (Math.random() > 0.95) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    addNewOrganism(new LilyPadSeedOrganism(sq));
                                }
                            }
                            break;

                        case "moss":
                            if (Math.random() > 0.95) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    addNewOrganism(new MossSeedOrganism(sq));
                                }
                            }
                            break;

                        case "mosscool":
                            if (Math.random() > 0.95) {
                                var sq = addSquare(new SeedSquare(px, py));
                                if (sq) {
                                    addNewOrganism(new MossCoolSeedOrganism(sq));
                                }
                            }
                            break;

                        case "hydrangea":
                            if (organismAddedThisClick) {
                                return;
                            }
                            var sq = addSquare(new SeedSquare(px, py));
                            if (sq) {
                                addNewOrganism(new HydrangeaSeedOrganism(sq));
                                organismAddedThisClick = true;
                            }
                            break;

                        case "Sunflower":
                            if (organismAddedThisClick) {
                                return;
                            }
                            var sq = addSquare(new SeedSquare(px, py));
                            if (sq) {
                                addNewOrganism(new SunflowerSeedOrganism(sq));
                                organismAddedThisClick = true;
                            }
                            break;

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
                    }
                }
            }
        }
        lastLastMoveOffset = lastMoveOffset;
    }
}

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
}

for (let i = 0; i < CANVAS_SQUARES_X; i++) {
    for (let j = 1; j < 10; j++) {
        addSquareByNameSetTemp(i, CANVAS_SQUARES_Y - (1 + j), "dirt");
    }
    addSquareByNameSetTemp(i, 0, "water");

}

// for (let i = 0; i < CANVAS_SQUARES_Y; i++) {
//     addSquare(new RockSquare(CANVAS_SQUARES_X - 1, i));
//     addSquare(new RockSquare(0, i));
// }
window.oncontextmenu = function () {
    return false;     // cancel default menu
}
main()


window.onload = function () {
    document.addEventListener('keydown', function (e) {
        if (e.code === "ShiftLeft") {
            shiftPressed = true;
        }
    }, false);

    document.addEventListener('keyup', function (e) {
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

// loadSlotFromSave(volcano);

  
function getGlobalThetaBase() {
    return global_theta_base;
}

export {
    MAIN_CANVAS, MAIN_CONTEXT, CANVAS_SQUARES_X, CANVAS_SQUARES_Y, BASE_SIZE, global_theta_base, selectedViewMode, addSquareByName,
    setCanvasSquaresX, setCanvasSquaresY,
    getCanvasSquaresX, getCanvasSquaresY,
    getBlockModification_val,
    getNewBlockTemperatureVal, getNewBlockLockedTemperature,
    getGlobalThetaBase,
    zoomCanvasFillRect
}

