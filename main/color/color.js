// credit: https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
export function rgb2hsv(r, g, b) {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b);
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}
// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
export function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}

export function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

export function rgbToRgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

export function hsvToHex(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => 255 * (v - v * s * Math.max(Math.min(k, 4 - k, 1), 0));
    return "#" + (1 << 24 | f(5) << 16 | f(3) << 8 | f(1)).toString(16).slice(1);
}

export function hsvToRgba(h, s, v, o) {
    let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return "rgba(" + f(5) + "," + f(3) + "," + f(1) + "," + o + ")";
}