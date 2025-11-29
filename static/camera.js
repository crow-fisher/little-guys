import { decayVec, getBaseSize, getCanvasHeight, getCanvasWidth } from "./canvas.js";
import { addVectors, crossVec3, invertMat4, multiplyMatrixAndPoint, multiplyVectorByScalar, normalizeVec3, subtractVectors, transposeMat4 } from "./climate/stars/matrix.js";
import { getCurDay } from "./climate/time.js";
import { COLOR_RED, COLOR_WHITE } from "./colors.js";
import { hexToRgb, randRange, rgbToHex } from "./common.js";
import { MAIN_CONTEXT } from "./index.js";
import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CANVAS_SQUARES_ZOOM, UI_CAMERA_OFFSET_VEC, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_STARMAP_FOV, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_ROTATION_VEC_DT, saveGD } from "./ui/UIData.js";


// https://learnopengl.com/Getting-started/Camera
export function getFrameCameraMatrix() {

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

    let from = structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));

    // forward = [0, 0, -1, from[0]];
    // right = [-1, 0, 0, from[1]];
    // up = [0, 1, 0, from[2]];

    cameraToWorld = [
        right,
        up,
        forward,
        [0, 0, 0, 1]
    ];

    worldToCamera = transposeMat4(cameraToWorld);
    worldToCamera[3] = [0, 0, 0, 1];
    return worldToCamera;
}

let cameraToWorld = [
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
        cameraToWorld = getFrameCameraMatrix();
        frameMatrixDay = getCurDay();
    }

    let point = addVectors([x, y, z, 1], loadGD(UI_CAMERA_OFFSET_VEC));
    return pointToScreen(...multiplyMatrixAndPoint(cameraToWorld, point));
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
    let cameraZ = point[2];
    if (cameraZ < 0)
        return null;

    return [getCanvasWidth() * point[0] / cameraZ, getCanvasHeight() * point[1] / cameraZ, cameraZ]
}

export function renderTest() {
    return;
    let cl = loadGD(UI_CAMERA_OFFSET_VEC);
    cl = [0, 0, 0];
    for (let x = 0; x < 255; x += .8) {
        for (let z = 0; z < 255; z += .8) {
            let dx = x - cl[0];
            let dz = z - cl[1];

            let adx = (Math.abs(dx) / 10000);
            let adz = (Math.abs(dz) / 10000);

            x += adx;
            z += adz;
            let y = -9 - 100 * Math.sin((x * z + ((Date.now() / (10 + (.01 * adz))) % 628)) / 100);
            y = 10 * Math.sin((x * (1 + z/1000)) + (Date.now() / 1000) % 100)

            renderTestPoint(x, y, z, rgbToHex(x, (x + z) / 2, z));
        }
    }
    renderTestPoints();
}

function renderTestVec(from, vec, scalar = 10) {
    let to = structuredClone(from);
    to = addVectors(to, multiplyVectorByScalar(vec, scalar));

    let fc = cartesianToScreen(...from);
    let ft = cartesianToScreen(...to);

    if (fc != null && ft != null) {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(...fc);
        MAIN_CONTEXT.lineTo(...ft);
        MAIN_CONTEXT.stroke();
    }
}

let test_points = new Array();
function renderTestPoints() {
    test_points.sort((a, b) => a[0] - b[0]);
    test_points.forEach((pointArr) => {
        let color = pointArr[1];
        let loc = pointArr[2];
        let size = pointArr[3];
        MAIN_CONTEXT.fillStyle = color;

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.arc(loc[0], loc[1], size, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
    });
    test_points = new Array();
}

function renderTestPoint(x, y, z, color) {
    let point = cartesianToScreen(x, y, z);
    if (point != null) {
        let pz = point[2];
        let size = Math.max(1, 800 / pz);
        test_points.push([z, color, point, size]);
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

function _applyDerivativeVec(k1, p2, valuemode = false, applyFrac = 1) {
    let co = loadGD(k1);
    let cs = valuemode ? p2 : loadGD(p2);

    co[0] += cs[0] * applyFrac;
    co[1] += cs[1] * applyFrac;
    co[2] += cs[2] * applyFrac;

    cs[0] *= 0.7;
    cs[1] *= 0.7;
    cs[2] *= 0.7;

    saveGD(k1, co);
    if (!valuemode)
        saveGD(p2, cs);
}

export function canvasPan3DRoutine() {
    let rotNorm = [0, 0, 0];

    let cr = loadGD(UI_CAMERA_ROTATION_VEC);
    let cd = loadGD(UI_CAMERA_OFFSET_VEC_DT);
    let yaw = cr[0];
    let pitch = cr[1];

    rotNorm[0] = Math.cos(yaw) * Math.cos(pitch);
    rotNorm[1] = Math.sin(pitch);
    rotNorm[2] = Math.sin(yaw) * Math.cos(pitch);

    let forward = rotNorm;
    let right = normalizeVec3(crossVec3([0, 1, 0], forward));
    let up = normalizeVec3(crossVec3(forward, right));

    let fo = multiplyVectorByScalar(forward, cd[0]);
    let ro = multiplyVectorByScalar(right, cd[1]);
    let uo = multiplyVectorByScalar(up, cd[2]);

    let offset = [0, 0, 0];
    offset = addVectors(offset, fo);
    offset = addVectors(offset, ro);
    offset = addVectors(offset, uo);

    decayVec(UI_CAMERA_OFFSET_VEC_DT);

    _applyDerivativeVec(UI_CAMERA_OFFSET_VEC, offset, true, .1);
    // _applyDerivativeVec(UI_CAMERA_OFFSET_VEC, UI_CAMERA_OFFSET_VEC_DT);
    _applyDerivativeVec(UI_CAMERA_ROTATION_VEC, UI_CAMERA_ROTATION_VEC_DT);

    let bound = Math.PI / 2 - 0.0001;
    cr[1] = Math.max(-bound, Math.min(bound, cr[1]))
    saveGD(UI_CAMERA_ROTATION_VEC, cr);
    return;
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