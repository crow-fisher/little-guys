import { GrowthComponent, GrowthPlan, GrowthPlanStep } from "./organisms/GrowthPlan.js";
import { addSquare, iterateOnSquares } from "./squares/_sqOperations.js";
import { getTemperatureMap, getWaterSaturationMap } from "./climate/simulation/temperatureHumidity.js";
import { getCurDay, setCurDay } from "./climate/time.js";
import { ProtoMap, TypeMap } from "./types.js";
import { getWindPressureMap } from "./climate/simulation/wind.js";
import { _GAMEDATA_DEFAULT, _UI_DEFAULT, getGAMEDATA, getUICONFIG, loadGD, loadUI, saveGD, saveMapEntry, saveUI, setGAMEDATA, setUICONFIG, UI_LIGHTING_ENABLED, UI_MAIN_NEWWORLD, UI_MAIN_NEWWORLD_LATITUDE, UI_MAIN_NEWWORLD_LONGITUDE, UI_MAIN_NEWWORLD_NAME, UI_MAIN_NEWWORLD_SIMHEIGHT, UI_NAME, UI_SIMULATION_CLOUDS, UI_SIMULATION_HEIGHT, UI_TOPBAR_BLOCK, UI_TOPBAR_LIGHTING, UI_TOPBAR_MAINMENU, UI_TOPBAR_SIMULATION, UI_TOPBAR_TIME, UI_TOPBAR_VIEWMODE, UI_UI_CURWORLD, UI_UI_LASTSAVED, UI_UI_NEXTWORLD, UI_UI_SIZE, UI_UI_WORLDDELETED, UI_UI_WORLDHIDDEN, UI_UI_WORLDNAME, UI_UI_WORLDPAGE, UICONFIG } from "./ui/UIData.js";
import { getTotalCanvasPixelWidth, indexCanvasSize } from "./index.js";
import { STAGE_DEAD } from "./organisms/Stages.js";
import { getMainMenuComponent, initUI } from "./ui/WindowManager.js";
import { initGroupList, purgeMaps, regSquareToGroup } from "./globals.js";
import { getActiveClimate } from "./climate/climateManager.js";
import { doSingleTimeMouseEvent } from "./mouse.js";
import { downloadFile, MOUSEEVENT_UNHIDE } from "./common.js";
import { resetZoom } from "./canvas.js";


let saveOrLoadInProgress = false;

export function isSaveOrLoadInProgress() {
    return saveOrLoadInProgress;
}

export function setSaveOrLoadInProgress(value) {
    saveOrLoadInProgress = value;
}

export async function loadSlot(slotName) {
    console.log("Loading slot: ", slotName);
    slotName = "" + slotName;
    saveOrLoadInProgress = true;
    const db = await openDatabase();
    const transaction = db.transaction("saves", "readonly");
    const store = transaction.objectStore("saves");

    saveUI(UI_UI_CURWORLD, slotName);

    return new Promise((resolve, reject) => {
        const request = store.get(slotName);
        request.onsuccess = async () => {
            if (request.result) {
                const decompressedSave = await decompress(request.result.data);
                const saveObj = JSON.parse(decompressedSave);
                loadSlotData(saveObj);
                resolve(saveObj);
            } else {
                alert("Issue in saves; deleting all save data");
                deleteAllSaveData();

            }
        };
        request.onerror = () => reject(request.error);
    });
}

export async function gameUserStateLoad() {
    try {
        const db = await openDatabase();
        const transaction = db.transaction("settings", "readonly");
        const store = transaction.objectStore("settings");
        return new Promise((resolve, reject) => {
            const request = store.get("UI");
            request.onsuccess = async () => {
                if (request.result) {
                    const decompressedSave = await decompress(request.result.data);
                    const saveObj = JSON.parse(decompressedSave);
                    setUICONFIG(saveObj);
                    if (loadUI(UI_UI_CURWORLD < 0)) {
                        loadEmptyScene();
                        initUI();
                        indexCanvasSize();
                    } else {
                        let p = loadSlot(loadUI(UI_UI_CURWORLD));
                        await p;
                        saveGD(UI_TOPBAR_MAINMENU, false);
                        saveGD(UI_TOPBAR_BLOCK, false);
                        saveGD(UI_TOPBAR_LIGHTING, false);
                        saveGD(UI_TOPBAR_VIEWMODE, false);
                        saveGD(UI_TOPBAR_SIMULATION, false);
                        saveGD(UI_TOPBAR_TIME, false);
                        initUI();
                    }
                    resolve(saveObj);
                } else {
                    console.log("No existing UI save data found.");
                    let w = getTotalCanvasPixelWidth();
                    if (w < 1500) {
                        saveMapEntry(UICONFIG, UI_UI_SIZE, 8);
                    } else if (w < 2000) {
                        saveMapEntry(UICONFIG, UI_UI_SIZE, 12);
                    } else {
                        saveMapEntry(UICONFIG, UI_UI_SIZE, 16);
                    }
                    let promise = createNewWorld();
                    await promise;
                    indexCanvasSize(true);

                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch {
        console.log("No existing UI save data found.");
        if (getTotalCanvasPixelWidth() < 1500) {
            saveMapEntry(UICONFIG, UI_UI_SIZE, 8);
        } else {
            saveMapEntry(UICONFIG, UI_UI_SIZE, 12);
        }
        initUI();
    }
}
export async function saveUserSettings() {
    const compressedSave = await compress(JSON.stringify(getUICONFIG()));
    const db = await openDatabase();
    const transaction = db.transaction("settings", "readwrite");
    const store = transaction.objectStore("settings");
    await new Promise((resolve, reject) => {
        const request = store.put({ slot: "UI", data: compressedSave });
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
    });

    console.log("saveUserSettings completed.");
}

export function purgeGameState() {
    iterateOnSquares((sq) => sq.destroy());
    purgeMaps();
}

export function loadSlotData(slotData) {
    purgeGameState();
    loadSlotFromSave(slotData);
    saveGD(UI_MAIN_NEWWORLD, false);
    saveOrLoadInProgress = false;
}



export function unhideWorld(slotName) {
    loadUI(UI_UI_WORLDHIDDEN)[slotName] = false;
    saveUserSettings();
}

export function hideWorld(slotName) {
    doSingleTimeMouseEvent(MOUSEEVENT_UNHIDE, () => {
        loadUI(UI_UI_WORLDHIDDEN)[slotName] = true;
        saveUserSettings();
    });
}

export function deleteHiddenWorlds() {
    Object.keys(loadUI(UI_UI_WORLDHIDDEN)).forEach((key) => loadUI(UI_UI_WORLDDELETED)[key] = loadUI(UI_UI_WORLDHIDDEN)[key]);
    saveUserSettings();
}

export function doPeriodicSave() {
    if (loadUI(UI_UI_LASTSAVED) < (Date.now() - (1000 * 60 * 60))) {
        saveCurGame(false);
    }
}

export async function saveCurGame(reload = false) {
    console.log("save cur game\t", loadUI(UI_UI_CURWORLD));
    await saveGame(loadUI(UI_UI_CURWORLD), reload);
}

export async function downloadSaveFile() {
    saveOrLoadInProgress = true;
    const saveObj = getFrameSaveData();
    const saveString = JSON.stringify(saveObj);
    const compressedSave = await compress(saveString);

    downloadFile(loadGD(UI_NAME) + (new Date()).toISOString() + ".lg", compressedSave);
    loadSlotData(saveObj);
}


export async function saveGame(slotName, reload) {
    saveOrLoadInProgress = true;
    const saveObj = getFrameSaveData();
    const saveString = JSON.stringify(saveObj);
    console.log("Saving slot name " + slotName + " as " + loadGD(UI_NAME));
    await doSave(slotName, saveString);
    loadUI(UI_UI_WORLDNAME)[slotName] = loadGD(UI_NAME);
    saveUI(UI_UI_LASTSAVED, Date.now());
    purgeMaps();
    loadSlotData(saveObj);
}

async function doSave(slotName, saveString) {
    slotName = "" + slotName;
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
        const request = indexedDB.open("lgdb_7", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("saves")) {
                db.createObjectStore("saves", { keyPath: "slot" });
            }
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "slot" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function compressSquares(squares) {
    let sqArr = new Array();
    let orgArr = new Array();
    let lsqArr = new Array();
    let growthPlanArr = new Array();
    let growthPlanComponentArr = new Array();
    let growthPlanStepArr = new Array();
        squares.forEach((sq) => {
        sq.lighting = [];
        sq.linkedOrganisms = Array.from(sq.linkedOrganisms.map((org) => {
            if (org.stage != STAGE_DEAD) {
                orgArr.push(org);
                lsqArr.push(...org.lifeSquares);
                growthPlanArr.push(...org.growthPlans);
                growthPlanComponentArr.push(...org.growthPlans.map((gp) => gp.component));
                org.growthPlans.forEach((gp) => growthPlanStepArr.push(...gp.steps));

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

                if (org.greenType != null)
                    org.greenType = org.greenType.name;
                if (org.rootType != null)
                    org.rootType = org.rootType.name;

                return org;
            } else {
                org.destroy();
                return null;
            };
        }).filter((v) => v != null));
        sq.linkedOrganisms = Array.from(sq.linkedOrganisms.map((org) => orgArr.indexOf(org)));
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.map((lsq) => lsqArr.indexOf(lsq)));
        sqArr.push(sq)
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
        gp.steps = Array.from(gp.steps.filter((gps) => gps.completed).map((gps) => growthPlanStepArr.indexOf(gps)));
        gp.component = growthPlanComponentArr.indexOf(gp.component);
    });

    return [sqArr, orgArr, lsqArr, growthPlanArr, growthPlanComponentArr, growthPlanStepArr]
}


function getFrameSaveData() {
    let squares = new Array();
    iterateOnSquares((sq) => squares.push(sq));
    let compressed = compressSquares(squares);
    let sqArr = compressed[0]
    let orgArr = compressed[1]
    let lsqArr = compressed[2]
    let growthPlanArr = compressed[3]
    let growthPlanComponentArr = compressed[4]
    let growthPlanStepArr = compressed[5]

    let saveObj = {
        sqArr: sqArr,
        orgArr: orgArr,
        lsqArr: lsqArr,
        growthPlanArr: growthPlanArr,
        growthPlanComponentArr: growthPlanComponentArr,
        growthPlanStepArr: growthPlanStepArr,
        curDay: getCurDay(),
        windMap: getWindPressureMap(),
        temperatureMap: getTemperatureMap(),
        waterSaturationMap: getWaterSaturationMap(),
        gamedata: getGAMEDATA()
    }
    return saveObj;
}

export async function createNewWorld() {
    let startNumPages = getMainMenuComponent().getNumPages();

    let slot = loadUI(UI_UI_NEXTWORLD);
    loadEmptyScene();
    saveGD(UI_NAME, loadGD(UI_MAIN_NEWWORLD_NAME));
    saveGD(UI_SIMULATION_HEIGHT, loadGD(UI_MAIN_NEWWORLD_SIMHEIGHT));
    getActiveClimate().lat = loadGD(UI_MAIN_NEWWORLD_LATITUDE);
    getActiveClimate().lng = loadGD(UI_MAIN_NEWWORLD_LONGITUDE);
    saveUI(UI_UI_CURWORLD, slot);
    saveUI(UI_UI_NEXTWORLD, slot + 1);
    saveGD(UI_MAIN_NEWWORLD, false);
    saveGD(UI_LIGHTING_ENABLED, true);
    saveGD(UI_SIMULATION_CLOUDS, true);
    saveCurGame();
    let endNumPages = getMainMenuComponent().getNumPages();
    if (endNumPages > startNumPages) {
        saveUI(UI_UI_WORLDPAGE, loadUI(UI_UI_WORLDPAGE) + 1);
    }
}

export function editCurrentWorld() {
    let slot = loadUI(UI_UI_CURWORLD);
    saveGD(UI_NAME, loadGD(UI_MAIN_NEWWORLD_NAME));
    saveGD(UI_SIMULATION_HEIGHT, loadGD(UI_MAIN_NEWWORLD_SIMHEIGHT));
    getActiveClimate().lat = loadGD(UI_MAIN_NEWWORLD_LATITUDE);
    getActiveClimate().lng = loadGD(UI_MAIN_NEWWORLD_LONGITUDE);
    saveCurGame();
}

export function loadSlotFromSave(slotData) {
    initGroupList();

    let sqArr = slotData.sqArr;
    let orgArr = slotData.orgArr;
    let lsqArr = slotData.lsqArr;

    let growthPlanArr = slotData.growthPlanArr;
    let growthPlanComponentArr = slotData.growthPlanComponentArr;
    let growthPlanStepArr = slotData.growthPlanStepArr;

    setCurDay(slotData.curDay);
    setGAMEDATA(slotData.gamedata)

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
        sq.linkedOrganisms = Array.from(sq.linkedOrganisms.filter((idx) => idx != -1).map((orgIdx) => orgArr[orgIdx]));
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.filter((idx) => idx != -1).map((lsqIdx) => lsqArr[lsqIdx]));
        regSquareToGroup(sq.group);

        sq.linkedOrganisms.forEach((org) => {
            org.linkedSquare = sq;
            org.growthPlans = Array.from(org.growthPlans.map((gp) => growthPlanArr[gp]));
            org.lifeSquares = Array.from(org.lifeSquares.map((lsq) => lsqArr[lsq]));
            org.originGrowth = growthPlanComponentArr[org.originGrowth];
            org.lifeSquares.forEach((lsq) => {
                lsq.lighting = [];
                lsq.linkedSquare = sq;
                lsq.linkedOrganism = org;
                lsq.component = growthPlanComponentArr[lsq.component];
            });
            org.greenType = TypeMap[org.greenType];
            org.rootType = TypeMap[org.rootType];
        });
    });
    sqArr.forEach(addSquare);
    indexCanvasSize(false);
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
export async function decompress(base64String) {
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

export function deleteAllSaveData() {
    window.indexedDB.databases().then((r) => {
        for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
    }).then(() => {
        alert('All save data cleared.');
    });
    loadEmptyScene();
    setGAMEDATA(structuredClone(_GAMEDATA_DEFAULT));
    setUICONFIG(structuredClone(_UI_DEFAULT)); 
    resetZoom();
}


export function loadEmptyScene() {
    purgeGameState();
    resetZoom();
}
