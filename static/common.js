// pure functions only

function getObjectArrFromMap(baseMap, posX, posY) {
    if (!(posX in baseMap)) {
        baseMap[posX] = new Map();
    }
    if (!(posY in baseMap[posX])) {
        baseMap[posX][posY] = new Array();
    }
    return baseMap[posX][posY];
}

function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function randNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function loadImage(url) {
    let i = new Image();
    i.src = url;
    return i;
}

export {getObjectArrFromMap, removeItemAll, hexToRgb, rgbToHex, randNumber, loadImage}