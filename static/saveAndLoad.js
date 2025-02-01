import { reduceNextLightUpdateTime, removeSquare } from "./globalOperations.js";
import { ALL_SQUARES } from "./globals.js";
import { CANVAS_SQUARES_Y } from "./index.js";
import { addSquare, addSquareOverride, iterateOnSquares } from "./squares/_sqOperations.js";
import { ProtoMap } from "./types.js";

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
                    obj.lighting = null;
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

export async function loadSlot(slotName) {
    var sqLoad = localStorage.getItem("ALL_SQUARES_" + slotName);
    if (sqLoad == null) {
        alert("no data to load!!! beep boop :(")
        return null;
    }
    // These are not our 'real' objects - they are JSON objects.
    // So they don't have functions and such. 
    const loaded_ALL_SQUARES = JSON.parse(await base64ToGzip(sqLoad));
    loadObjArr(loaded_ALL_SQUARES, addSquareOverride)
    reduceNextLightUpdateTime(10 ** 8);
}

export async function saveSlot(slotName) {
    const compressedSquares = await gzipToBase64(JSON.stringify(ALL_SQUARES));
    localStorage.setItem("ALL_SQUARES_" + slotName, compressedSquares);
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