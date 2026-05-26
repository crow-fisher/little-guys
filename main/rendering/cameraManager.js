import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CAMERA_FOV } from "../ui/UIData.js";
import { CoordinateSet } from "./model/CoordinateSet.js";
import { multiplyMat3AndPointInplace, transposeMat3Inplace } from "../util/matrix.js";
import { copyVecValue } from "../util/vector.js";

let params = new URLSearchParams(document.location.search);


export class CameraManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.cameraToWorld = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
        this.worldToCamera = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
        this.perspectiveMatrix = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
        this.rotNorm = [0, 0, 0];
        this.forward = [0, 0, 0];
        this.right = [0, 0, 0];
        this.up = [0, 0, 0];

        this.setFramePerspectiveMatrix();
    }

    cartesianToScreenInplace(cartesian, camera, screen) {
        multiplyMat3AndPointInplace(this.cameraToWorld, cartesian, camera);
        multiplyMat3AndPointInplace(this.perspectiveMatrix, camera, screen);
    }
    screenToRenderScreen(screenRef, renderNormRef, renderScreenRef) {
        renderNormRef[0] = (screenRef[0] / screenRef[2]);
        renderNormRef[1] = (screenRef[1] / screenRef[2]);
        renderScreenRef[0] = (renderNormRef[0] + this.xOffset) * this.s;
        renderScreenRef[1] = (renderNormRef[1] + this.yOffset) * this.s;
        renderScreenRef[2] = screenRef[2];
    }
    update() {
        this.setFrameCameraMatrix();
    }
    render() {
        this.renderDebugPoints();
    }

    renderPoint(p) {
        this.mainManager.canvasManager.context.fillStyle = hsvToHex(60, .8, .75);
        this.mainManager.canvasManager.context.beginPath();
        this.mainManager.canvasManager.context.arc(p[0], p[1], 8, 0, 2 * Math.PI, false);
        this.mainManager.canvasManager.context.fill();
    }
    
    renderDebugPlane() {
        let max = 1000;
        let step = 10;
        let points = new Array();
        let i = 0;
        for (let x = -max; x < max; x++) {
            for (let y = -max; y < max; y++) {
                for (let z = -max; z < max; z++) {
                    i += 1;
                    if (points[i] == null) {
                        points[i] = new CoordinateSet();
                    }
                    points[i].setWorld([x, y, z]);

                }
            }
        }
    }

    setFrameCameraMatrix() {
        this.yaw = loadGD(UI_CAMERA_ROTATION_VEC)[0];
        this.pitch = loadGD(UI_CAMERA_ROTATION_VEC)[1];

        rotNorm[0] = Math.cos(yaw) * Math.cos(pitch);
        rotNorm[1] = Math.sin(pitch);
        rotNorm[2] = Math.sin(yaw) * Math.cos(pitch);

        this.forward = normalizeVec3(subtractVectors([0, 0, 0], rotNorm));
        this.right = normalizeVec3(crossVec3([0, 1, 0], forward));
        this.up = normalizeVec3(crossVec3(forward, right));

        copyVecValue(this.right, this.cameraToWorld[0]);
        copyVecValue(this.up, this.cameraToWorld[1]);
        copyVecValue(this.forward, this.cameraToWorld[2]);

        transposeMat3Inplace(cameraToWorld, worldToCamera);
        return worldToCamera;
    }

    setFramePerspectiveMatrix() {
        let n = 1; // near clipping plane;
        let f = 1000; // far clipping plane;
        let fov = loadGD(UI_CAMERA_FOV);
        let S = 1 / (Math.tan((fov / 2) * (Math.PI / 180)));
        this.perspectiveMatrix = [
            [S, 0, 0],
            [0, S, 0],
            [0, 0, -(f / (f - n))]
        ];
    }

    setFrameCanvasRenderParams() {
        this._cw = this.mainManager.canvasManager.canvas.width;
        this._ch = this.mainManager.canvasManager.canvas.height;
        this._max = Math.max(this._cw, this._ch);
        this._yOffset = (this._max / this._cw) / 2;
        this._xOffset = (this._max / this._ch) / 2;
        this._s = Math.min(this._cw, this._ch);
    }
}