import { CoordinateSet } from "./model/CoordinateSet.js";
import { multiplyMat3AndPointInplace, transposeMat3Inplace } from "../util/matrix.js";
import { addVectorsMult, copyVecValue, crossVec3Dest, multiplyVectorByScalar, multiplyVectorByScalarDest, multiplyVectorByScalarDestAdd, normalizeVec3, subtractVectorsDest } from "../util/vector.js";
import { hsvToHex } from "../color/color.js";
import { KeyboardCamera3ControlManager } from "./control/keyboard3CameraControlManager.js";
import { MouseCamera3ControlManager } from "./control/mouseCamera3ControlManager.js";
import { RuntimeComponent } from "../runtimeComponent.js";
import { MouseCamera2ControlManager } from "./control/mouseCamera2ControlManager.js";

export class CameraManager extends RuntimeComponent {
    constructor() {
        super();
        this.camera3ControlManagers = [
            new KeyboardCamera3ControlManager(this),
            new MouseCamera3ControlManager(this)
        ]

        this.camera2ControlManagers = [
            new MouseCamera2ControlManager(this),
        ]
        
        this.camera2ViewportCenter = [0, 0];
        this.camera2Zoom = 1;

        this.totalWidth = 0;
        this.totalHeight = 0;
        this.windowWidth = 0;
        this.windowHeight = 0;
        this.windowWidthStart = 0;
        this.windowHeightStart = 0;
        this.windowWidthEnd = 0;
        this.windowHeightEnd = 0;
        
        this.camera3Offset = [0, 0, 0];
        this.camera3OffsetDt = [0, 0, 0];
        this.camera3Movement = [0, 0, 0];
        this.camera3Rotation = [0, .3, 0];
        this.camera3RotationDt = [0, 0, 0];
        this.camera3Fov = 80;

        this.rotNorm = [0, 0, 0];
        
        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.camera3ToWorld = [
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

        this.frame = 0;
        this.setFramePerspectiveMatrix();
    }
    
    di(mainManager) {
        this.mainManager = mainManager;
        this.canvasManager = this.mainManager.canvasManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
    }

    canvasTick2D() {
        this.totalWidth = this.canvasManager.canvas.width;
        this.totalHeight = this.canvasManager.canvas.height;
        this.windowWidth = this.totalWidth / this.camera2Zoom;
        this.windowHeight = this.totalHeight / this.camera2Zoom;
        this.windowWidthStart = this.camera2ViewportCenter[0] - (this.windowWidth / 2);
        this.windowHeightStart = this.camera2ViewportCenter[1] - (this.windowHeight / 2);
        this.windowWidthEnd = this.camera2ViewportCenter[0] + (this.windowWidth / 2);
        this.windowHeightEnd = this.camera2ViewportCenter[1] + (this.windowHeight / 2);
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
        this.camera2ControlManagers.forEach((cm) => cm.process())
        this.camera3ControlManagers.forEach((cm) => cm.process())
        
        this.canvasTick2D();
        
        this.movementTick();
        this.setFrameCameraMatrix();
        this.setFrameCanvasRenderParams();
        this.setFramePerspectiveMatrix();
        this.frame += 1;
    }

    movementTick() {
        multiplyVectorByScalarDest(this.right, this.camera3OffsetDt[0], this.camera3Movement);
        multiplyVectorByScalarDestAdd(this.up, this.camera3OffsetDt[1], this.camera3Movement);
        multiplyVectorByScalarDestAdd(this.forward, this.camera3OffsetDt[2], this.camera3Movement);

        addVectorsMult(this.camera3Offset, this.camera3Movement, 5);
        multiplyVectorByScalar(this.camera3OffsetDt, 0.8);
    }
    render() {
        // this.renderDebugPoints();
    }

    renderPoint(p) {
        this.canvasManager.context.fillStyle = hsvToHex(60, .8, .75);
        this.canvasManager.context.beginPath();
        this.canvasManager.context.arc(p[0], p[1], 8, 0, 2 * Math.PI, false);
        this.canvasManager.context.fill();
    }
    
    renderDebugPoints() {
        let max = 300;
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
        
        let renderedPoints = 0;

        points.forEach((p) => {
            if (!p.isVisibleOnScreen()) {
                return;
            }
            renderedPoints += 1;
            this.canvasManager.context.fillStyle = hsvToHex(p.distToCamera % 360, .8, .75);
            this.canvasManager.context.beginPath();
            this.canvasManager.context.arc(p.renderScreen[0], p.renderScreen[1], 800 / p.distToCamera, 0, 2 * Math.PI, false);
            this.canvasManager.context.fill();
        });

        this.canvasManager.context.fillStyle = hsvToHex(0, 0, 1);
        this.canvasManager.context.fillText(renderedPoints, 100, 400)


    }

    setFrameCameraMatrix() {
        this.yaw = this.camera3Rotation[0];
        this.pitch = this.camera3Rotation[1];

        this.rotNorm[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.rotNorm[1] = Math.sin(this.pitch);
        this.rotNorm[2] = Math.sin(this.yaw) * Math.cos(this.pitch);

        subtractVectorsDest([0, 0, 0], this.rotNorm, this.forward);
        normalizeVec3(this.forward);
        crossVec3Dest([0, 1, 0], this.forward, this.right);
        normalizeVec3(this.right);
        crossVec3Dest(this.forward, this.right, this.up);
        normalizeVec3(this.up);

        copyVecValue(this.right, this.camera3ToWorld[0]);
        copyVecValue(this.up, this.camera3ToWorld[1]);
        copyVecValue(this.forward, this.camera3ToWorld[2]);
        
        transposeMat3Inplace(this.camera3ToWorld, this.worldToCamera);
    }

    setFramePerspectiveMatrix() {
        this.n = 1; // near clipping plane;
        this.f = 1000; // far clipping plane;
        this.S = 1 / (Math.tan((this.camera3Fov / 2) * (Math.PI / 180)));
        this.perspectiveMatrix[0][0] = this.S;
        this.perspectiveMatrix[1][1] = this.S;
        this.perspectiveMatrix[2][2] = -(this.f / (this.f - this.n));
    }

    setFrameCanvasRenderParams() {
        this.cw = this.canvasManager.canvas.width;
        this.ch = this.canvasManager.canvas.height;
        this.max = Math.max(this.cw, this.ch);
        this.yOffset = (this.max / this.cw) / 2;
        this.xOffset = (this.max / this.ch) / 2;
        this.s = Math.min(this.cw, this.ch);
    }

    getCanvasWidth() {
        return this.canvasManager.canvas.width;
    }
    getCanvasHeight() {
        return this.canvasManager.canvas.height;
    }
    getFrameMouseMove() {
        return this.mainManager.inputManager.mouseManager.movement;
    }
    isFrameButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isFrameButtonPressed(b)
    }
    isButtonPressed(b) {
        return this.mainManager.inputManager.mouseManager.isButtonPressed(b)
    }
    isPointerLocked() {
        return this.canvasManager.pointerLock;
    }
    isKeyPressed(key) {
        return this.mainManager.inputManager.isKeyPressed(key);
    }
    lockPointer() {
        this.canvasManager.lockPointer();
    }
    unlockPointer() {
        this.canvasManager.unlockPointer();
    }
}