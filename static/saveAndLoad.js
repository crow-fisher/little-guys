import { nextLightingUpdate, reduceNextLightUpdateTime, removeSquare } from "./globalOperations.js";
import { ALL_ORGANISM_SQUARES, ALL_ORGANISMS, ALL_SQUARES } from "./globals.js";
import { addSquareByNameSetTemp, CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { addOrganismSquare } from "./lifeSquares/_lsOperations.js";
import { addOrganism, iterateOnOrganisms, removeOrganism } from "./organisms/_orgOperations.js";
import { GrowthComponent, GrowthPlan, GrowthPlanStep } from "./organisms/parameterized/GrowthPlan.js";
import { pond } from "./saves.js";
import { triggerEarlySquareScheduler } from "./scheduler.js";
import { addSquare, addSquareOverride, iterateOnSquares, removeOrganismSquare } from "./squares/_sqOperations.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { getTemperatureMap, getWaterSaturation, getWaterSaturationMap, setTemperatureMap, setWaterSaturationMap } from "./temperature_humidity.js";
import { getCurDay, setCurDay } from "./time.js";
import { ProtoMap, TypeMap, TypeNameMap } from "./types.js";
import { getWindPressureMap, initializeWindPressureMap, setWindPressureMap } from "./wind.js";


export async function loadSlot(slotName) {
    const db = await openDatabase();
    const transaction = db.transaction("saves", "readonly");
    const store = transaction.objectStore("saves");

    return new Promise((resolve, reject) => {
        const request = store.get(slotName);
        request.onsuccess = async () => {
            if (request.result) {
                const decompressedSave = await decompress(request.result.data);
                const saveObj = JSON.parse(decompressedSave);
                loadSlotData(saveObj);
                resolve(saveObj);
            } else {
                reject(new Error("Save slot not found"));
            }
        };
        request.onerror = () => reject(request.error);
    });
}

function purgeGameState() {
    iterateOnSquares((sq) => removeSquare(sq));
    iterateOnOrganisms((org) => {
        org.lifeSquares.forEach((lsq) => removeOrganismSquare(lsq));
        removeOrganism(org);
    });
    initializeWindPressureMap();
}

function loadSlotData(slotData) {
    purgeGameState();
    loadSlotFromSave(slotData);
    reduceNextLightUpdateTime(10 ** 8);
}
export function saveSlot(slotName) {
    const saveObj = getFrameSaveData();
    const saveString = JSON.stringify(saveObj);
    purgeGameState();
    doSave(slotName, saveString);
    loadSlotData(saveObj)
}

async function doSave(slotName, saveString) {
    const compressedSave = await compress(saveString);

    const db = await openDatabase();
    const transaction = db.transaction("saves", "readwrite");
    const store = transaction.objectStore("saves");

    await new Promise((resolve, reject) => {
        const request = store.put({ slot: slotName, data: compressedSave });
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
    });

    console.log("Game saved to IndexedDB!");
}

async function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("GameSavesDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("saves")) {
                db.createObjectStore("saves", { keyPath: "slot" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getFrameSaveData() {
    var sqArr = new Array();
    var orgArr = new Array();
    var lsqArr = new Array();
    var growthPlanArr = new Array();
    var growthPlanComponentArr = new Array();
    var growthPlanStepArr = new Array();

    iterateOnOrganisms((org) => {
        orgArr.push(org);
        lsqArr.push(...org.lifeSquares);
        growthPlanArr.push(...org.growthPlans);
        growthPlanComponentArr.push(...org.growthPlans.map((gp) => gp.component))
        org.growthPlans.forEach((gp) => growthPlanStepArr.push(...gp.steps));
    });

    growthPlanStepArr.forEach((gps) => {
        gps.growthPlan = growthPlanArr.indexOf(gps.growthPlan);
        gps.completedSquare = lsqArr.indexOf(gps.completedSquare);
    });

    growthPlanComponentArr.forEach((gpc) => {
        gpc.growthPlan = growthPlanArr.indexOf(gpc.growthPlan);
        gpc.lifeSquares = Array.from(gpc.lifeSquares.map((lsq) => lsqArr.indexOf(lsq)));
        gpc.parentComponent = growthPlanComponentArr.indexOf(gpc.parentComponent);
        gpc.children = Array.from(gpc.children.map((child) => growthPlanComponentArr.indexOf(child)));
    });

    growthPlanArr.forEach((gp) => {
        gp.steps = Array.from(gp.steps.map((gps) => growthPlanStepArr.indexOf(gps)));
        gp.component = growthPlanComponentArr.indexOf(gp.component);
    });

    iterateOnSquares((sq) => {
        sq.lighting = [];
        if (sq.linkedOrganism != null)
            sq.linkedOrganism = orgArr.indexOf(sq.linkedOrganism);
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.map((lsq) => lsqArr.indexOf(lsq)));
        sqArr.push(sq)
    });

    iterateOnOrganisms((org) => {
        org.lighting = [];
        org.linkedSquare = sqArr.indexOf(org.linkedSquare);
        org.growthPlans = Array.from(org.growthPlans.map((gp) => growthPlanArr.indexOf(gp)));
        org.lifeSquares.forEach((lsq) => {
            lsq.lighting = [];
            lsq.linkedSquare = sqArr.indexOf(lsq.linkedSquare);
            lsq.linkedOrganism = orgArr.indexOf(lsq.linkedOrganism);
            lsq.component = growthPlanComponentArr.indexOf(lsq.component);
        });
        org.lifeSquares = Array.from(org.lifeSquares.map((lsq) => lsqArr.indexOf(lsq)));
        org.originGrowth = growthPlanComponentArr.indexOf(org.originGrowth);
        if (org.greenType != null) {
            org.greenType = org.greenType.name;
            org.rootType = org.rootType.name;
        }
    })

    var saveObj = {
        sqArr: sqArr,
        orgArr: orgArr,
        lsqArr: lsqArr,
        growthPlanArr: growthPlanArr,
        growthPlanComponentArr: growthPlanComponentArr,
        growthPlanStepArr: growthPlanStepArr,
        curDay: getCurDay(),
        windMap: getWindPressureMap(),
        temperatureMap: getTemperatureMap(),
        waterSaturationMap: getWaterSaturationMap()
    }
    return saveObj;
}



function loadSlotFromSave(slotData) {
    var sqArr = slotData.sqArr;
    var orgArr = slotData.orgArr;
    var lsqArr = slotData.lsqArr;
    var growthPlanArr = slotData.growthPlanArr;
    var growthPlanComponentArr = slotData.growthPlanComponentArr;
    var growthPlanStepArr = slotData.growthPlanStepArr;

    var windMap = slotData.windMap;
    var temperatureMap = slotData.temperatureMap;
    var waterSaturationMap = slotData.waterSaturationMap;

    if (windMap != null) {
        setWindPressureMap(windMap);
        setTemperatureMap(temperatureMap);
        setWaterSaturationMap(waterSaturationMap);
    } else {
        initializeWindPressureMap();
    }

    setCurDay(slotData.curDay);


    sqArr.forEach((sq) => Object.setPrototypeOf(sq, ProtoMap[sq.proto]));
    orgArr.forEach((org) => Object.setPrototypeOf(org, ProtoMap[org.proto]));
    lsqArr.forEach((lsq) => Object.setPrototypeOf(lsq, ProtoMap[lsq.proto]));

    growthPlanArr.forEach((gp) => Object.setPrototypeOf(gp, GrowthPlan.prototype));
    growthPlanComponentArr.forEach((gpc) => Object.setPrototypeOf(gpc, GrowthComponent.prototype));
    growthPlanStepArr.forEach((gps) => Object.setPrototypeOf(gps, GrowthPlanStep.prototype));

    growthPlanStepArr.forEach((gps) => {
        gps.growthPlan = growthPlanArr[gps.growthPlan];
        if (gps.completedSquare != -1) {
            gps.completedSquare = lsqArr[gps.completedSquare];
        }
    });

    growthPlanComponentArr.forEach((gpc) => {
        gpc.growthPlan = growthPlanArr[gpc.growthPlan];
        gpc.lifeSquares = Array.from(gpc.lifeSquares.map((lsq) => lsqArr[lsq]));
        gpc.parentComponent = growthPlanComponentArr[gpc.parentComponent];
        gpc.children = Array.from((gpc.children.map((ggpc) => growthPlanComponentArr[ggpc])));
    });

    growthPlanArr.forEach((gp) => {
        gp.steps = Array.from(gp.steps.map((gps) => growthPlanStepArr[gps]));
        gp.component = growthPlanComponentArr[gp.component];
    });

    sqArr.forEach((sq) => {
        if (sq.linkedOrganism == -1) {
            sq.linkedOrganism = null;
        } else {
            sq.linkedOrganism = orgArr[sq.linkedOrganism];
        }
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.map((lsqIdx) => lsqArr[lsqIdx]));
    });

    sqArr.forEach(addSquareOverride);

    orgArr.forEach((org) => {
        org.linkedSquare = sqArr[org.linkedSquare];
        org.growthPlans = Array.from(org.growthPlans.map((gp) => growthPlanArr[gp]));
        org.lifeSquares = Array.from(org.lifeSquares.map((lsq) => lsqArr[lsq]));
        org.originGrowth = growthPlanComponentArr[org.originGrowth];
        org.lifeSquares.forEach((lsq) => {
            lsq.lighting = [];
            lsq.linkedSquare = sqArr[lsq.linkedSquare];
            lsq.linkedOrganism = orgArr[lsq.linkedOrganism];
            lsq.component = growthPlanComponentArr[lsq.component];
        });

        org.greenType = TypeMap[org.greenType];
        org.rootType = TypeMap[org.rootType];

        addOrganism(org);
        org.lifeSquares.forEach(addOrganismSquare);
    });
    triggerEarlySquareScheduler();
    reduceNextLightUpdateTime(10 ** 8);
}

async function compress(inputString) {
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
async function decompress(base64String) {
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

export async function loadDemoScene() {
    purgeGameState();
    let scene = await decompress(pond);
    loadSlotData(JSON.parse(scene));
}

export function loadEmptyScene() {
    purgeGameState();
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        addSquare(new RockSquare(i, CANVAS_SQUARES_Y - 1));
    }
    reduceNextLightUpdateTime(10 ** 8);
}

export function loadFlatDirtWorld() {
    loadEmptyScene();
    for (let i = 0; i < CANVAS_SQUARES_X; i++) {
        for (let j = 1; j < 10; j++) {
            var square = addSquareByNameSetTemp(i, CANVAS_SQUARES_Y - (1 + j), "loam");
            if (square)
                square.randomize();
        }
        addSquareByNameSetTemp(i, 30, "water");
    }

}

