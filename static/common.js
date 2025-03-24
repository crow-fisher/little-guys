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
    let i = 0;
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
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function hexToRgbArr(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function rgbToRgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}


export function hueShiftColor(hex, hueShift, saturationShift, valueShift) {
    let hsv = rgb2hsv(...hexToRgbArr(hex))
    hsv[0] += hueShift;
    hsv[1] += saturationShift;
    hsv[2] += valueShift;
    let rgb = hsv2rgb(...hsv);
    return {r: rgb[0], g: rgb[1], b: rgb[2]};
}

export function hueShiftColorArr(hex, hueShift, saturationShift, valueShift) {
    let hsv = rgb2hsv(...hexToRgbArr(hex))
    hsv[0] += hueShift;
    hsv[1] += saturationShift;
    hsv[2] += valueShift;
    return hsv2rgb(...hsv);
}


function randNumber(min, max) {
    max += 1;
    return Math.floor(Math.random() * (max - min) + min);
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function organismProgressCalculus(amount, period) {
    return (amount / (period ** 2)) * 2;
}

function loadImage(url) {
    let i = new Image();
    i.src = url;
    return i;
}

function getStandardDeviation(array) {
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function processColorStdev(val_max, val, val_stdev, color) {
    return processColorStdevMulticolor(val_max, val, val_stdev, color, { r: 255, g: 255, b: 255 });
}

function processColorLerp(val, val_min, val_max, color) {
    return processColorLerpBicolor(val, val_min, val_max, color, { r: 255, g: 255, b: 255 });
}

function processColorLerpBicolor(val, val_min, val_max, color1, color2) {
    let p = (val - val_min) / (val_max - val_min);
    return {
        r: Math.floor(color1.r * (1 - p) + color2.r * (p)),
        g: Math.floor(color1.g * (1 - p) + color2.g * (p)),
        b: Math.floor(color1.b * (1 - p) + color2.b * (p))
    }
}

function processColorStdevMulticolor(val_max, val, val_stdev, color1, color2) {
    let z = (val_max - val) / val_stdev;
    let p = getZPercent(z);
    return {
        r: Math.floor(color1.r * (1 - p) + color2.r * (p)),
        g: Math.floor(color1.g * (1 - p) + color2.g * (p)),
        b: Math.floor(color1.b * (1 - p) + color2.b * (p))
    }
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

    let factK = 1;
    let sum = 0;
    let term = 1;
    let k = 0;
    let loopStop = Math.exp(-23);

    while (Math.abs(term) > loopStop) {
        term = .3989422804 * Math.pow(-1, k) * Math.pow(z, k) / (2 * k + 1) / Math.pow(2, k) * Math.pow(z, k + 1) / factK;
        sum += term;
        k++;
        factK *= k;
    }

    sum += 0.5;

    return sum;
}

function getDist(x1, x2, y1, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
  }



// yeah thanks to this person don't understand what the fuck is happening here but don't care 
// https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript

// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
export function rgb2hsv(r,g,b) {
    let v=Math.max(r,g,b), c=v-Math.min(r,g,b);
    let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
    return [60*(h<0?h+6:h), v&&c/v, v];
  }
// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
export function hsv2rgb(h,s,v) 
{                              
  let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];       
}   
export { getObjectArrFromMap, removeItemAll, hexToRgb, rgbToHex, rgbToRgba, 
    randNumber, randRange, loadImage, getStandardDeviation, getZPercent,
     processColorStdev, processColorStdevMulticolor, processColorLerp, 
     processColorLerpBicolor, getDist, dec2bin}
