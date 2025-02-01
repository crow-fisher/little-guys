import { nextLightingUpdate, reduceNextLightUpdateTime, removeSquare } from "./globalOperations.js";
import { ALL_ORGANISM_SQUARES, ALL_ORGANISMS, ALL_SQUARES } from "./globals.js";
import { CANVAS_SQUARES_Y } from "./index.js";
import { addOrganismSquare } from "./lifeSquares/_lsOperations.js";
import { addOrganism, iterateOnOrganisms, removeOrganism } from "./organisms/_orgOperations.js";
import { GrowthComponent, GrowthPlan, GrowthPlanStep } from "./organisms/parameterized/GrowthPlan.js";
import { addSquare, addSquareOverride, iterateOnSquares, removeOrganismSquare } from "./squares/_sqOperations.js";
import { ProtoMap } from "./types.js";


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
    const saveData = JSON.parse(await base64ToGzip(save));
    loadSlotFromSave(saveData);

    reduceNextLightUpdateTime(10 ** 8);
}

export async function saveSlot(slotName) {

    var sqArr = new Array();
    var orgArr = new Array(); 
    var lsqArr = new Array();
    var growthPlanArr = new Array();
    var growthPlanComponentArr = new Array();

    iterateOnOrganisms((org) => {
        orgArr.push(org);
        lsqArr.push(...org.lifeSquares);
    });

    iterateOnSquares((sq) => {
        sq.lighting = [];
        if (sq.linkedOrganism != null)
            sq.linkedOrganism = orgArr.indexOf(sq.linkedOrganism);
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.map((lsq) => lsqArr.indexOf(lsq)));
        sqArr.push(sq)
    });

    iterateOnOrganisms((org) => {
        if (org.linkedSquare == null || org.lifeSquares.length == 0) {
            return;
        }
        org.growthPlans.forEach((gp => {
            gp.component.lifeSquares = Array.from(gp.component.lifeSquares.map((lsq) => lsqArr.indexOf(lsq)));
            growthPlanArr.push(gp);
            growthPlanComponentArr.push(gp.component);
            gp.component = growthPlanComponentArr.indexOf(gp.component);
        }));
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
    })

    var saveObj = {
        sqArr: sqArr,
        orgArr: orgArr,
        lsqArr: lsqArr,
        growthPlanArr: growthPlanArr,
        growthPlanComponentArr: growthPlanComponentArr
    }
    const compressedSave = await gzipToBase64(JSON.stringify(saveObj));
    localStorage.setItem("save_" + slotName, compressedSave);
}


async function loadSlotFromSave(slotData) {
    iterateOnSquares((sq) => removeSquare(sq));
    iterateOnOrganisms((org) => {
        org.lifeSquares.forEach((lsq) => removeOrganismSquare(lsq));
        removeOrganism(org);
    });

    var sqArr = slotData.sqArr;
    var orgArr = slotData.orgArr;
    var lsqArr = slotData.lsqArr;
    var growthPlanArr = slotData.growthPlanArr;
    var growthPlanComponentArr = slotData.growthPlanComponentArr;

    growthPlanArr.forEach((gp) => gp.component = growthPlanComponentArr[gp.component]);

    sqArr.forEach((sq) => {
        if (sq.linkedOrganism == -1) {
            sq.linkedOrganism = null;
        }
        sq.linkedOrganism = orgArr[sq.linkedOrganism];
        sq.linkedOrganismSquares = Array.from(sq.linkedOrganismSquares.map((lsqIdx) => lsqArr[lsqIdx]));
        Object.setPrototypeOf(sq, ProtoMap[sq.proto]);
    });
    sqArr.forEach(addSquareOverride);

    orgArr.forEach((org) => {
        org.linkedSquare = sqArr.indexOf(org.linkedSquare);
        org.growthPlans = Array.from(org.growthPlans.map((gp) => growthPlanArr[gp]));

        org.growthPlans.forEach((gp) => {
            Object.setPrototypeOf(gp, GrowthPlan.prototype);
            Object.setPrototypeOf(gp.component, GrowthComponent.prototype);
            gp.steps.forEach((gps) => Object.setPrototypeOf(gps, GrowthPlanStep.prototype));
            gp.component.lifeSquares = Array.from(gp.component.lifeSquares.map((lsq) => lsqArr[lsq]));
        })

        org.lifeSquares = Array.from(org.lifeSquares.map((lsq) => lsqArr[lsq]));
        org.lifeSquares.forEach((lsq) => {
            lsq.lighting = [];
            lsq.linkedSquare = sqArr[lsq.linkedSquare];
            lsq.linkedOrganism = orgArr[lsq.linkedOrganism];
            lsq.component = growthPlanComponentArr[lsq.component];
        })

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
