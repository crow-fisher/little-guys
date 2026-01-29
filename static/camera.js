import { decayVec, getBaseSize, getCanvasHeight, getCanvasWidth, getCurZoom } from "./canvas.js";
import { addVectors, crossVec3, multiplyMatrixAndPoint, multiplyMatrixAndPointInplace, multiplyVectorByScalar, normalizeVec3, subtractVectors, transposeMat4 } from "./climate/stars/matrix.js";
import { getCurDay } from "./climate/time.js";
import { COLOR_WHITE } from "./colors.js";
import { rgbToHex } from "./common.js";
import { MAIN_CONTEXT } from "./index.js";
import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CAMERA_OFFSET_VEC, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_ROTATION_VEC_DT, saveGD, UI_CAMERA_FOV, addUIFunctionMap, UI_STARMAP_ZOOM, UI_STARMAP_PREV_ZOOM } from "./ui/UIData.js";

let params = new URLSearchParams(document.location.search);

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
let perspectiveMatrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]
let frameMatrixDay = 0;


export function getForwardVec() {
    return cameraToWorld[2];
}
export function getCameraRotationVec() {
    return subtractVectors([0, 0, 0], getForwardVec());
}

// this implementation of a 3d camera uses a lookat matrix to manage the camera position and direction,
// and a perspective matrix for going from that to screen space. 

// refs:
// https://learnopengl.com/Getting-started/Camera
// https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html
// https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function/framing-lookat-function.html

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

function setFramePerspectiveMatrix() {
    let n = 1; // near clipping plane;
    let f = 1000; // far clipping plane;
    let fov = loadGD(UI_CAMERA_FOV);
    let S = 1 / (Math.tan((fov / 2) * (Math.PI / 180)));
    perspectiveMatrix = [
        [S, 0, 0, 0],
        [0, S, 0, 0],
        [0, 0, -(f / (f - n)), -1],
        [0, 0, -(f * n) / (f - n), 0]
    ];
}

export function frameMatrixReset() {
    if (getCurDay() != frameMatrixDay) {
        cameraToWorld = getFrameCameraMatrix();
        frameMatrixDay = getCurDay();
        setFramePerspectiveMatrix();
    }
}


export function cartesianToScreen(x, y, z) {
    if (getCurDay() != frameMatrixDay) {
        cameraToWorld = getFrameCameraMatrix();
        frameMatrixDay = getCurDay();
        setFramePerspectiveMatrix();
    }
    // by convention, x and y are inverted
    let point = addVectors([x, -y, z, 1], loadGD(UI_CAMERA_OFFSET_VEC));
    return pointToScreen(...multiplyMatrixAndPoint(cameraToWorld, point));
}

export function reset3DCameraTo2DScreen() {
    return;
        let bs = getBaseSize();
        let cx = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / bs;
        let cy = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) / bs;
         // if mouse moves more than canvas, go closer (make cz smaller). if mouse moving less than canvas, other way 
        let cz = 256 - 24 * (getCurZoom());
        saveGD(UI_CAMERA_OFFSET_VEC, [-cx, cy, cz, 1]);
        saveGD(UI_CAMERA_ROTATION_VEC, [Math.PI / 2, 0, 0, 0]);
        saveGD(UI_CAMERA_OFFSET_VEC_DT, [0, 0, 0, 0]);
        saveGD(UI_CAMERA_ROTATION_VEC_DT, [0, 0, 0, 0]);
}
export function cartesianToScreenInplace(cartesian, camera, screen) {
}

export function cartesianToCamera(cartesian, camera) {
    multiplyMatrixAndPointInplace(cameraToWorld, cartesian, camera);
}

export function cameraToScreen(camera, screen) {
    multiplyMatrixAndPointInplace(perspectiveMatrix, camera, screen);

}

export function screenToRenderScreen(screenRef, renderNormRef, renderScreenRef, xOffset, yOffset, s) {
    if (screenRef[2] < 0) {
        return;
    }
    renderNormRef[0] = (screenRef[0] / screenRef[2]);
    renderNormRef[1] = (screenRef[1] / screenRef[2]);
    renderScreenRef[0] = (renderNormRef[0] + xOffset) * s;
    renderScreenRef[1] = (renderNormRef[1] + yOffset) * s;
    renderScreenRef[2] = screenRef[2];
}

export function pointToScreen(x, y, z) {
    x *= -1;
    y *= -1;

    let point = multiplyMatrixAndPoint(perspectiveMatrix, [x, y, z, 1]);
    let cameraZ = point[2];
    if (cameraZ < 0)
        return null;

    let pxr = point[0] / cameraZ;
    let pyr = point[1] / cameraZ;

    let cw = getCanvasWidth();
    let ch = getCanvasHeight();

    let max = Math.max(cw, ch);
    let yOffset = (max / cw) / 2;
    let xOffset = (max / ch) / 2;
    
    let px = xOffset + pxr;
    let py = yOffset + pyr;

    let s = Math.min(cw, ch);

    return [s * px, s * py, cameraZ]
}

export function render3DHud() {
    // renderPlanes();
    renderTest();
    renderPoints();
}

function renderPlanes() {
    let xo = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize();
    let yo = -loadGD(UI_CANVAS_VIEWPORT_CENTER_Y) / getBaseSize();
    for (let y = -200; y <= 200; y += 200) {
        for (let x = -100; x < 100; x += 8) {
            for (let z = -100; z < 100; z += 8) {
                renderPoint(x + xo, y + yo, z, COLOR_WHITE);
            }
        }
    }
}

function renderTest() {
    let renderTest1 = params.get("renderTest1");
    let renderTest1Size = params.get("renderTest1Size") ?? 255;
    let renderTest1NumPointsX = params.get("renderTest1NumPointsX") ?? 100;
    let renderTest1NumPointsZ = params.get("renderTest1NumPointsZ") ?? 100;
    let renderTest1Height = params.get("renderTest1Height") ?? 10;
    let renderTest1Rate = params.get("renderTest1Rate") ?? 1000;

    let cl = loadGD(UI_CAMERA_OFFSET_VEC);

    if (renderTest1) {
        for (let x = 10; x < renderTest1Size; x += renderTest1Size / renderTest1NumPointsX) {
            for (let z = 0; z < renderTest1Size; z += renderTest1Size / renderTest1NumPointsZ) {
                let dx = x - cl[0];
                let dz = z - cl[2];

                let adx = Math.sin((Math.abs(dx) / 10000));
                let adz = Math.sin((Math.abs(dz) / 10000));

                let y = -9 - 10 * Math.sin((x * z + ((Date.now() / (10 + (.01 * adz))) % 628)) / 100);
                y = renderTest1Height * Math.sin((x * (1 + z / 1000)) + (Date.now() / renderTest1Rate) % 100)
                renderPoint(x, y, z, rgbToHex(x, (x + z) / 2, z));
            }
        }
    }

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

let renderpoint_queue = new Array();
function renderPoints() {
    renderpoint_queue.sort((a, b) => (b[0] - a[0]));
    renderpoint_queue.forEach((pointArr) => {
        let color = pointArr[1];
        let loc = pointArr[2];
        let size = pointArr[3];
        MAIN_CONTEXT.fillStyle = color;
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.arc(loc[0], loc[1], size, 0, 2 * Math.PI, false);
        MAIN_CONTEXT.fill();
    });
    renderpoint_queue = new Array();
}

export function renderPoint(x, y, z, color) {
    let point = cartesianToScreen(x, y, z);
    if (point != null) {
        let pz = point[2];
        let size = Math.max(1, 800 / pz);
        renderpoint_queue.push([point[2], color, point, size]);
    }
}


export function renderVec(v1, v2, color) {
    let p1 = cartesianToScreen(...v1);
    let p2 = cartesianToScreen(...v2);

    if (p1 != null && p2 != null) {
        let pz = p1[2];
        let size = Math.max(1, 200 / pz);
        MAIN_CONTEXT.lineWidth = size;
        MAIN_CONTEXT.strokeStyle = color;
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(...p1);
        MAIN_CONTEXT.lineTo(...p2);
        MAIN_CONTEXT.stroke();
    }
}

export function getCameraPosition() {
    return structuredClone(loadGD(UI_CAMERA_OFFSET_VEC));
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

    decayVec(UI_CAMERA_OFFSET_VEC_DT, 0.93);

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
