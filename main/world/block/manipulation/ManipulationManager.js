import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../../rendering/model/LineRenderJob.js";
import { RenderJob } from "../../../rendering/model/RenderJob.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { loadGD, UI_TOPBAR_BLOCK } from "../../../ui/UIData.js";
import { copyMatValue } from "../../../util/matrix.js";
import { isPointInsideQuad } from "../../../util/quad.js";
import { addVec3Dest, addVec3Mult, addVec3MultDest, addVec3MultFloor, addVectorsMult, copyVecValue, vec3Dot } from "../../../util/vector.js";
import { Block } from "../model/Block.js";
import { StoneBlock } from "../model/variant/StoneBlock.js";
import { Plane } from "./model/Plane.js";

export class ManipulationManager {
    constructor(blockManager) {
        this.blockManager = blockManager;
        this.uiManager = blockManager.uiManager;
        this.inputManager = blockManager.worldManager.mainManager.inputManager;
        this.mouseManager = blockManager.worldManager.mainManager.inputManager.mouseManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = blockManager.worldManager.mainManager.rasterizationManager;
        this.planeManagerComponent = blockManager.worldManager.mainManager.uiManager.planeManagerComponent;
        this.colorConfig = blockManager.worldManager.mainManager.uiManager.colorConfig;

        let pSize = 20;
        this.zPlane = new Plane(this, 0, Math.PI / 2, 1, pSize, pSize);

        this.zTopPlane = new Plane(this, 0, Math.PI / 2, 1, pSize, pSize);
        this.zTopPlane.centerCs.world[1] -= 10;
        this.zTopPlane.processPositionUpdate();

        this.newPlane = new Plane(this, 0, Math.PI / 2, 1, 20, 20);
        this.planes = [this.zPlane];

    }

    update() {
        if (this.uiManager.toolbarConfig.activeBrushMode == 0) {
            return this.updatePlane();
        }

        if (!this.updateBlockConditional())
            return;

        switch (this.uiManager.toolbarConfig.activeBrushMode) {
            case 1:
                return this.updateBlock((parentSurface) => this.blockManipFuncAdd(parentSurface));
            case 2:
                return this.updateBlock((parentSurface) => this.blockManipFuncReplace(parentSurface));
            case 3:
                return this.updateBlock((parentSurface) => this.blockManipFuncErase(parentSurface));
        }
    }

    updateBlockConditional() {
        switch (this.uiManager.toolbarConfig.clickMode) {
            case 1:
                return this.mouseManager.isFrameButtonPressed(0);
            case 0:
            default:
                return this.mouseManager.isButtonPressed(0)
        }
    }

    updateBlock(appliedFunc) {
        let bArr = new Array();
        this.blockManager.iterateOnSectors((sector) => sector.iterateOnBlocks((block) => block.renderedFaces.filter((faceArr) => isPointInsideQuad(
            this.inputManager.mouseManager.offset,
            faceArr[0][0].renderScreen,
            faceArr[0][1].renderScreen,
            faceArr[0][2].renderScreen,
            faceArr[0][3].renderScreen
        )).forEach((faceArr) => bArr.push(faceArr))));
        if (bArr.length == 0) {
            return;
        }
        bArr.sort((a, b) => a[1].centerCs.distToCamera - b[1].centerCs.distToCamera);
        appliedFunc(bArr[0]);
    }

    blockManipFuncAdd(parentSurface) {
        let cartesian = [0, 0, 0];
        addVec3Dest(parentSurface[1].cartesian, parentSurface[2], cartesian);
        this.blockManager.addNewBlock(cartesian)
    }

    blockManipFuncReplace(parentSurface) {
        this.blockManager.applyBlockAttributes(parentSurface[1]);
    }

    blockManipFuncErase(parentSurface) {
        parentSurface[1].destroy();
    }

    updatePlane() {
        if (this.planeManagerComponent.gcvZMode() == 0 || this.mouseManager.isButtonPressed(1)) {
            this.zPlane.centerCs.world[0] = this.cameraManager.cameraOffset[0];
            this.zPlane.centerCs.world[2] = this.cameraManager.cameraOffset[2];
            this.zPlane.centerCs.world[1] = this.cameraManager.cameraOffset[1] + 4;
            this.zPlane.processPositionUpdate();
        }

        if (!this.updateBlockConditional())
            return;

        if (this.planeManagerComponent.gcvModMode() == 1) {
            copyVecValue(this.cameraManager.cameraOffset, this.newPlane.centerCs.world);
            addVec3Mult(this.newPlane.centerCs.world, this.cameraManager.forward, -this.planeManagerComponent.gcvModDist());
            this.newPlane.processPositionUpdate();
        }

        if (this.planeManagerComponent.dirtyConfig) {
            this.newPlane.step = Math.round(this.planeManagerComponent.gcvPlaneStep());
            this.newPlane.dimWidth = Math.round(this.planeManagerComponent.gcvPlaneSizeX()) * this.newPlane.step;
            this.newPlane.dimHeight = Math.round(this.planeManagerComponent.gcvPlaneSizeY()) * this.newPlane.step;
            this.newPlane.yaw = this.planeManagerComponent.gcvPlaneYaw();
            this.newPlane.pitch = this.planeManagerComponent.gcvPlanePitch();
            this.newPlane.processPositionUpdate();
        };


        if (!this.inputManager.isPointerLocked() && this.inputManager.mouseManager.isButtonPressed(0) || this.inputManager.mouseManager.isButtonPressed(2)) {
            this.planes.forEach((plane) => plane.setMouseHoverPoint(this.inputManager.mouseManager.offset));
            this.planes.sort((a, b) =>
                ((a.closestCs?.distToCamera ?? a.centerCs.distToCamera) - (b.closestCs?.distToCamera ?? b.centerCs.distToCamera)) + (a.closestDist - b.closestDist)
            );

            for (let p, i = 0; i < this.planes.length; i++) {
                p = this.planes[i];
                if (p.closestCs != null) {
                    this.blockManager.brushFromRef(p, p.closestCs, this.inputManager.mouseManager.isButtonPressed(0), this.inputManager.mouseManager.isButtonPressed(2));
                }
                if (p.isPointOver(this.inputManager.mouseManager.offset)) {
                    break;
                }
            }
        }
    }


    render() {
        if (this.uiManager.toolbarConfig.activeBrushMode == 0) {
            this.renderPlane();
        }
        else if (this.uiManager.toolbarConfig.activeBrushMode == 1) {
            this.renderBlock();
        }
    }
    renderPlane() {
        this.planes.forEach((plane) => plane.render())
        if (this.planeManagerComponent.gcvModMode() == 1) {
            this.newPlane.render();

            if (this.planeManagerComponent.gcvPlaneSubmit()) {
                this.planes.push(this.newPlane);
                this.newPlane = new Plane(this, 0, Math.PI / 2, 5, 5, 5);
                this.planeManagerComponent.scvPlaneSubmit(false)

                this.newPlane.step = Math.round(this.planeManagerComponent.gcvPlaneStep());
                this.newPlane.dimWidth = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
                this.newPlane.dimHeight = Math.round(this.planeManagerComponent.gcvPlaneStep()) * this.newPlane.step;
                this.newPlane.yaw = this.planeManagerComponent.gcvPlaneYaw();
                this.newPlane.pitch = this.planeManagerComponent.gcvPlanePitch();
                this.newPlane.processPositionUpdate();
            }

        }
    }

    renderBlock() {

    }
}