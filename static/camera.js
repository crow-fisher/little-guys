import { getBaseSize } from "./canvas.js";
import { addVectors, crossVec3, multiplyMatrixAndPoint, subtractVectors } from "./climate/stars/matrix.js";
import { getCurDay } from "./climate/time.js";
import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CANVAS_SQUARES_ZOOM, UI_CAMERA_OFFSET_VEC, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_STARMAP_FOV } from "./ui/UIData.js";


export function getFrameCameraMatrix() {
    let from = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
    let rotNorm = rotatePoint([0, 0, 1, 0], ...loadGD(UI_CAMERA_ROTATION_VEC));

    let to = addVectors(structuredClone(from), rotNorm);
    let forward = subtractVectors(structuredClone(from), to);
    let randomVec = [0, 1, 0];
    let right = crossVec3(randomVec, forward);
    let up = crossVec3(forward, right);

    right.push(0);
    up.push(0);

    return [
        right,
        up,
        forward,
        from,
    ];
}

let frameMatrix  = getFrameCameraMatrix();
let frameMatrixDay = getCurDay();

export function cartesianToScreen(x, y, z, w, force = false) {
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

    // this is what i need to do for  the camera but i dont wanna
    // https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function/framing-lookat-function.html

    if (getCurDay() != frameMatrixDay) {
        frameMatrix = getFrameCameraMatrix();
        frameMatrixDay = getCurDay();
    }
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
    let point = multiplyMatrixAndPoint(frameMatrix, [x, y, z, 1]);
    
    if (point.z > 0 && !force)
        return null

    let transformed = multiplyMatrixAndPoint(perspectiveMatrix, point);
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