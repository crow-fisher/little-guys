import { getBaseSize } from "./canvas.js";
import { multiplyMatrixAndPoint } from "./climate/stars/matrix.js";
import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CANVAS_SQUARES_ZOOM, UI_CAMERA_OFFSET_VEC, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_STARMAP_FOV } from "./ui/UIData.js";

export function cartesianToScreen(x, y, z, w, force = false) {
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html
    let fov = 180 / loadGD(UI_CANVAS_SQUARES_ZOOM);
    let r2d = 57.2958;
    let S = 1 / (Math.tan((fov / r2d) / 2) * (Math.PI / (180 / r2d)));
    
    S /= loadGD(UI_STARMAP_FOV);
    let perspectiveMatrix = [
        [S, 0, 0, 0],
        [0, S, 0, 0],
        [0, 0, S, -1],
        [0, 0, 1, 0]
    ];

    let cr = loadGD(UI_CAMERA_ROTATION_VEC);
    let camPos = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));

    camPos[0] += loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize();
    camPos[1] += loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) / getBaseSize();

    let point = [x - camPos[0], y - camPos[1], (z * -1) - camPos[2], 1];
    let pointRotated = rotatePoint(point, cr[0], cr[1], cr[2]);
    let transformed = multiplyMatrixAndPoint(perspectiveMatrix, pointRotated);
    return transformed;
}

export function rotatePoint(point, rX, rY, rZ) {
    return rotatePointRx(rotatePointRy(rotatePointRz(point, rZ), rY), rX);
}

export function rotatePointRx(point, theta) {
    let rotationMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(theta), -Math.sin(theta), 0],
        [0, Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrixAndPoint(rotationMatrix, point);
}

export function rotatePointRy(point, theta) {
    let rotationMatrix = [
        [Math.cos(theta), 0, Math.sin(theta), 0],
        [0, 1, 0, 0],
        [-Math.sin(theta), 0, Math.cos(theta), 0],
        [0, 0, 0, 1]
    ]
    return multiplyMatrixAndPoint(rotationMatrix, point);
}
export function rotatePointRz(point, theta) {
    let rotationMatrix = [
        [Math.cos(theta), -Math.sin(theta), 0, 0],
        [Math.sin(theta), Math.cos(theta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    return multiplyMatrixAndPoint(rotationMatrix, point);
}