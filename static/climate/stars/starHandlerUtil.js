import { invlerp, lerp } from "../../common.js";

// https://resources.wolframcloud.com/FormulaRepository/resources/Luminosity-Formula-for-Absolute-Magnitude
export function brightnessValueToLumens(brightness) {
    return (10 ** (0.4 * (4.83 - brightness))) / 85.50667128846837;
}

export function calculateStarTemperature(bv) {
    // https://web.archive.org/web/20230315074349/https://spiff.rit.edu/classes/phys445/lectures/colors/colors.html
    // https://iopscience.iop.org/article/10.1086/301490/pdf
    // https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
    return 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));
}
export function sphericalToCartesian(yaw, pitch, m) {
    let target = new Array(3);
    target[0] = m * Math.cos(yaw) * Math.cos(pitch);
    target[1] = m * Math.sin(pitch);
    target[2] = m * Math.sin(yaw) * Math.cos(pitch);
    return target;
}

export function adjustBoundsToIncludePoint(bounds, point) {
    bounds[0] = Math.min(bounds[0], point[0]);
    bounds[1] = Math.min(bounds[1], point[1]);
    bounds[2] = Math.min(bounds[2], point[2]);

    bounds[3] = Math.max(3, point[0]);
    bounds[4] = Math.max(4, point[1]);
    bounds[5] = Math.max(5, point[2]);
}
export function cartesianToSectorIndex(bounds, cartesianPoint, numSectors) {
    return [
        Math.floor(invlerp(bounds[0], bounds[3], cartesianPoint[0]) * numSectors)
        , Math.floor(invlerp(bounds[1], bounds[4], cartesianPoint[1]) * numSectors)
        , Math.floor(invlerp(bounds[2], bounds[5], cartesianPoint[2]) * numSectors)
    ];
}

export function sectorToCartesian(bounds, sectorPoint, numSectors) {
    return [
        lerp(bounds[0], bounds[3], sectorPoint[0] / numSectors)
        , lerp(bounds[1], bounds[4], sectorPoint[1] / numSectors)
        , lerp(bounds[2], bounds[5], sectorPoint[2] / numSectors)
    ];
}

export function getSectorSize(bounds, numSectors) {
    return [(bounds[3] - bounds[0]) / numSectors,
    (bounds[4] - bounds[1]) / numSectors,
    (bounds[5] - bounds[2]) / numSectors]
}

export function arrayOfVectorsToText(vecs, fractionDigits = 2) {
    let out = "";
    vecs.forEach((vec) => {
        out += "[" + vec[0].toFixed(fractionDigits);
        out += "," + vec[1].toFixed(fractionDigits);
        out += "," + vec[2].toFixed(fractionDigits) + "]\n";
    });
    return out;
}

export function arrayOfNumbersToText(vals, fractionDigits = 2) {
    let out = "";
    vals.forEach((val) => {
        out += "," + val.toFixed(fractionDigits) + "\n";
    });
    return out;
}