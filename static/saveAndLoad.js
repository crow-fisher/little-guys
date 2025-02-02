import { nextLightingUpdate, reduceNextLightUpdateTime, removeSquare } from "./globalOperations.js";
import { ALL_ORGANISM_SQUARES, ALL_ORGANISMS, ALL_SQUARES } from "./globals.js";
import { CANVAS_SQUARES_Y } from "./index.js";
import { addOrganismSquare } from "./lifeSquares/_lsOperations.js";
import { addOrganism, iterateOnOrganisms, removeOrganism } from "./organisms/_orgOperations.js";
import { GrowthComponent, GrowthPlan, GrowthPlanStep } from "./organisms/parameterized/GrowthPlan.js";
import { addSquare, addSquareOverride, iterateOnSquares, removeOrganismSquare } from "./squares/_sqOperations.js";
import { ProtoMap, TypeMap, TypeNameMap } from "./types.js";


/**'
 * 
 * 
 * objects will have a 'compression scheme' that tells us how to scrunch them up
 * 
 * we need to: 
 *  * take all of our objects and shove them into big lists
 *  * pull out all references to other objects and turn them into indexes into our big lists
 *  * turn all that into an object and serialize and save it
 * 
 * why do we do this? because this project is circular reference hell <3
 */


export async function loadSlot(slotName) {
    var save = localStorage.getItem("save_" + slotName);
    if (save == null) {
        alert("no data to load!!! beep boop :(")
        return null;
    }

    iterateOnSquares((sq) => removeSquare(sq));
    iterateOnOrganisms((org) => {
        org.lifeSquares.forEach((lsq) => removeOrganismSquare(lsq));
        removeOrganism(org);
    });


    const saveData = JSON.parse(await base64ToGzip(save));
    loadSlotFromSave(saveData);
    reduceNextLightUpdateTime(10 ** 8);
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
        growthPlanStepArr: growthPlanStepArr
    }
    return saveObj;
}


export async function saveSlot(slotName) {
    var saveObj = getFrameSaveData();
    var saveString = JSON.stringify(saveObj);

    const compressedSave = await gzipToBase64(saveString);
    localStorage.setItem("save_" + slotName, compressedSave);

    iterateOnSquares((sq) => removeSquare(sq));
    iterateOnOrganisms((org) => {
        org.lifeSquares.forEach((lsq) => removeOrganismSquare(lsq));
        removeOrganism(org);
    });

    loadSlotFromSave(JSON.parse(saveString));
}

function loadSlotFromSave(slotData) {
    var sqArr = slotData.sqArr;
    var orgArr = slotData.orgArr;
    var lsqArr = slotData.lsqArr;
    var growthPlanArr = slotData.growthPlanArr;
    var growthPlanComponentArr = slotData.growthPlanComponentArr;
    var growthPlanStepArr = slotData.growthPlanStepArr;

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
        org.linkedSquare = sqArr.indexOf(org.linkedSquare);
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
    reduceNextLightUpdateTime(10 ** 8);
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
