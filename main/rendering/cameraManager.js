import { loadGD, UI_CAMERA_ROTATION_VEC, UI_CAMERA_FOV, UI_CAMERA_OFFSET_VEC_DT, UI_CAMERA_OFFSET_VEC } from "../ui/UIData.js";
import { CoordinateSet } from "./model/CoordinateSet.js";
import { multiplyMat3AndPointInplace, multiplyMatrixAndPoint, transposeMat3Inplace } from "../util/matrix.js";
import { addVectors, copyVecValue, crossVec3Dest, multiplyVectorByScalar, multiplyVectorByScalarDest, multiplyVectorByScalarDestAdd, normalizeVec3, subtractVectorsDest } from "../util/vector.js";
import { hsvToHex } from "../color/color.js";
import { KeyboardCameraControlManager } from "./control/keyboardCameraControlManager.js";
import { MouseCameraControlManager } from "./control/mouseCameraControlManager.js";

let params = new URLSearchParams(document.location.search);


export class CameraManager {
    constructor(mainManager) {
        this.mainManager = mainManager;
        this.cameraControlManagers = [
            new KeyboardCameraControlManager(this),
            new MouseCameraControlManager(this)
        ]
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
        this.offset = [0, 0, 0];

        this.setFramePerspectiveMatrix();
    }

    cartesianToScreenInplace(cartesian, camera, screen) {
        multiplyMat3AndPointInplace(this.worldToCamera, cartesian, camera);
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
        this.cameraControlManagers.forEach((cm) => cm.process())
        this.movementTick();
        this.setFrameCameraMatrix();
        this.setFrameCanvasRenderParams();
    }

    movementTick() {
        this._ref = loadGD(UI_CAMERA_OFFSET_VEC_DT);
        multiplyVectorByScalarDest(this.right, this._ref[0], this.offset);
        multiplyVectorByScalarDestAdd(this.up, this._ref[1], this.offset);
        multiplyVectorByScalarDestAdd(this.forward, this._ref[2], this.offset);

        addVectors(loadGD(UI_CAMERA_OFFSET_VEC), this.offset);
        multiplyVectorByScalar(this._ref, 0.8);
    }
    render() {
        this.renderDebugPlane();
    }

    renderPoint(p) {
        this.mainManager.canvasManager.context.fillStyle = hsvToHex(60, .8, .75);
        this.mainManager.canvasManager.context.beginPath();
        this.mainManager.canvasManager.context.arc(p[0], p[1], 8, 0, 2 * Math.PI, false);
        this.mainManager.canvasManager.context.fill();
    }
    
    renderDebugPlane() {
        let max = 100;
        let step = 10;
        let points = new Array();
        let i = 0;
        for (let x = -max; x < max; x += step) {
            for (let y = -max; y < max; y += step) {
                for (let z = -max; z < max; z += step) {
                    i += 1;
                    if (points[i] == null) {
                        points[i] = new CoordinateSet(this);
                    }
                    points[i].setWorld([x, y, z]);

                }
            }
        }

        points.forEach((p) => {
            if (p.renderScreen[2] < 0) {
                return;
            }
            this.mainManager.canvasManager.context.fillStyle = hsvToHex(p.distToCamera % 360, .8, .75);
            this.mainManager.canvasManager.context.beginPath();
            this.mainManager.canvasManager.context.arc(p.renderScreen[0], p.renderScreen[1], 8, 0, 2 * Math.PI, false);
            this.mainManager.canvasManager.context.fill();
        });

    }

    setFrameCameraMatrix() {
        this.yaw = loadGD(UI_CAMERA_ROTATION_VEC)[0];
        this.pitch = loadGD(UI_CAMERA_ROTATION_VEC)[1];

        this.rotNorm[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.rotNorm[1] = Math.sin(this.pitch);
        this.rotNorm[2] = Math.sin(this.yaw) * Math.cos(this.pitch);

        subtractVectorsDest([0, 0, 0], this.rotNorm, this.forward);
        normalizeVec3(this.forward);
        crossVec3Dest([0, 1, 0], this.forward, this.right);
        normalizeVec3(this.right);
        crossVec3Dest(this.forward, this.right, this.up);
        normalizeVec3(this.up);

        copyVecValue(this.right, this.cameraToWorld[0]);
        copyVecValue(this.up, this.cameraToWorld[1]);
        copyVecValue(this.forward, this.cameraToWorld[2]);
        
        transposeMat3Inplace(this.cameraToWorld, this.worldToCamera);
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
        this.cw = this.mainManager.canvasManager.canvas.width;
        this.ch = this.mainManager.canvasManager.canvas.height;
        this.max = Math.max(this.cw, this.ch);
        this.yOffset = (this.max / this.cw) / 2;
        this.xOffset = (this.max / this.ch) / 2;
        this.s = Math.min(this.cw, this.ch);
    }
    getFrameMouseMove() {
        return this.mainManager.inputManager.mouseManager.movement;
    }
    isFrameButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isFrameButtonPressed(b)
    }
    isPointerLocked() {
        return this.mainManager.canvasManager.pointerLock;
    }
    isKeyPressed(key) {
        return this.mainManager.inputManager.isKeyPressed(key);
    }
    lockPointer() {
        this.mainManager.canvasManager.lockPointer();
    }
    unlockPointer() {
        this.mainManager.canvasManager.unlockPointer();
    }
}