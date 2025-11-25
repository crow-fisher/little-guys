import { getBaseSize, getCanvasHeight, getCanvasWidth } from "./canvas.js";
import { addVectors, crossVec3, invertMat4, multiplyMatrixAndPoint, normalizeVec3, subtractVectors, transposeMat4 } from "./climate/stars/matrix.js";
import { getCurDay } from "./climate/time.js";
import { COLOR_WHITE } from "./colors.js";
import { MAIN_CONTEXT } from "./index.js";
import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CANVAS_SQUARES_ZOOM, UI_CAMERA_OFFSET_VEC, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_STARMAP_FOV } from "./ui/UIData.js";


// https://learnopengl.com/Getting-started/Camera
export function getFrameCameraMatrix() {
    let from = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));

    let cr = loadGD(UI_CAMERA_ROTATION_VEC);
    let yaw = cr[0];
    let pitch = cr[1];

    let rotNorm = [0, 0, 0];

    rotNorm[0] = Math.cos(yaw) * Math.cos(pitch);
    rotNorm[1] = Math.sin(pitch);
    rotNorm[2] = Math.sin(yaw) * Math.cos(pitch);

    let forward = normalizeVec3(subtractVectors([0, 0, 0], rotNorm));
    let right = normalizeVec3(crossVec3([0, 1, 0], forward));
    let up = normalizeVec3(crossVec3(forward, right));

    forward.push(0);
    right.push(0);
    up.push(0);

    let func = (x) => x;
    // func = transposeMat4;
    // func = invertMat4;
    return func([
        right,
        up,
        forward,
        [0, 0, 0, 1]
    ]);
}

let frameMatrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]
let worldToCamera = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]
let frameMatrixDay = 0;


export function cartesianToScreen(x, y, z) {
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

    // this is what i need to do for  the camera but i dont wanna
    // https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function/framing-lookat-function.html

    if (getCurDay() != frameMatrixDay) {
        frameMatrix = getFrameCameraMatrix();
        frameMatrixDay = getCurDay();
    }
    return pointToScreen(...multiplyMatrixAndPoint(frameMatrix, [x, y, z, 1]));
    // z coordinates are now remapped to a range of 0,
    // subtractVectors(point, loadGD(UI_CAMERA_OFFSET_VEC));
    // if (point.z > 0 && !force)j
    // return null
}

export function pointToScreen(x, y, z) {
    let n = 1; // near clipping plane;
    let f = 1000; // far clipping plane;
    let S = 1 / Math.tan(loadGD(UI_STARMAP_FOV));
    let perspectiveMatrix = [
        [S, 0, 0, 0],
        [0, S, 0, 0],
        [0, 0, -(f / (f - n)), -1],
        [0, 0, -(f * n) / (f - n), 0]
    ];
    let point = multiplyMatrixAndPoint(perspectiveMatrix, [x, y, z, 1]);
    return [getCanvasWidth() * point[0] / point[2], getCanvasHeight() * point[1] / point[2]]
}

export function renderTest() {
    MAIN_CONTEXT.fillStyle = COLOR_WHITE;

    for (let x = 0; x < 100; x += 1) {
        for (let z = 0; z < 100; z += 1) {
            renderTestPoint(x, -10, z);
            renderTestPoint(x, 10, z);
        }
    }

    // for (let x = -1000; x <= 1000; x += 50) {
    //     for (let y = -1000; y <= 1000; y += 50) {
    //         for (let z = -50; z <= 100; z += 50) {
    //             renderTestPoint(x, y, z)
    //         }
    //     }
    // }
}

function renderTestPoint(x, y, z) {
    let point = cartesianToScreen(x, y, z);
    if (z > 0) {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.arc(point[0], point[1], 4, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
    }
}

function getFrameWorldToCameraMatrix() {
    let eye = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
    let rotNorm = rotatePoint([0, 0, 1, 0], ...loadGD(UI_CAMERA_ROTATION_VEC));
    let center = addVectors(structuredClone(eye), rotNorm);
    let arbUp = [0, 1, 0];
    worldToCamera = mat4x4_look_at(worldToCamera, eye, center, arbUp);
    return worldToCamera;
}

export function mat4x4_look_at(m, eye, center, up) {
    let f = normalizeVec3(subtractVectors(center, eye));
    let s = normalizeVec3(crossVec3(f, up));
    let t = crossVec3(s, f);

    m[0][0] = s[0];
    m[0][1] = t[0];
    m[0][2] = -f[0];
    m[0][3] = 0;

    m[1][0] = s[1];
    m[1][1] = t[1];
    m[1][2] = -f[1];
    m[1][3] = 0;

    m[2][0] = s[2];
    m[2][1] = t[2];
    m[2][2] = -f[2];
    m[2][3] = 0;

    m[3][0] = 0;
    m[3][1] = 0;
    m[3][2] = 0;
    m[3][3] = 1;

    return mat4x4_translate_in_place(m, -eye[0], -eye[1], -eye[2]);
}

function mat4x4_translate_in_place(m, x, y, z) {
    for (let i = 0; i < 4; i++) {
        m[i][0] += x;
        m[i][1] += y;
        m[i][2] += z;
    }
    return m;
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