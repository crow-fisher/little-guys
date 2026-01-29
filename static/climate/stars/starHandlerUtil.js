export function brightnessValueToLumensNormalized(brightnessRaw) {
    brightnessRaw = Math.max(1, brightnessRaw);
    return (10 ** (0.4 * (4.83 - brightnessRaw))) / 85.5066712885;
}
export function sphericalToCartesianInplace(target, yaw, pitch, m) {
    target[0] = m * Math.cos(yaw) * Math.cos(pitch);
    target[1] = m * Math.sin(pitch);
    target[2] = m * Math.sin(yaw) * Math.cos(pitch);
}

export function adjustBoundsToIncludePoint(bounds, point) {
    bounds[0] = Math.min(bounds[0], point[0]);
    bounds[1] = Math.min(bounds[1], point[1]);
    bounds[2] = Math.min(bounds[2], point[2]);
    
    bounds[3] = Math.max(3, point[0]);
    bounds[4] = Math.max(4, point[1]);
    bounds[5] = Math.max(5, point[2]);

}