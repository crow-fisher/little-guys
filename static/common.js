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

function rgbToRgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function randNumber(min, max) {
    max += 1;
    return Math.floor(Math.random() * (max - min) + min);
}

function loadImage(url) {
    let i = new Image();
    i.src = url;
    return i;
}

function getStandardDeviation (array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
  }


function getZPercent(z) {

// z == number of standard deviations from the mean

// if z is greater than 6.5 standard deviations from the mean the
// number of significant digits will be outside of a reasonable range

if (z < -6.5) {
    return 0.0;
}

if (z > 6.5) {
    return 1.0;
}

var factK = 1;
var sum = 0;
var term = 1;
var k = 0;
var loopStop = Math.exp(-23);

while(Math.abs(term) > loopStop) {
    term = .3989422804 * Math.pow(-1,k) * Math.pow(z,k) / (2 * k + 1) / Math.pow(2,k) * Math.pow(z,k+1) / factK;
    sum += term;
    k++;
    factK *= k;
}

sum += 0.5;

return sum;
}

export {getObjectArrFromMap, removeItemAll, hexToRgb, rgbToHex, rgbToRgba, randNumber, loadImage, getStandardDeviation, getZPercent }
