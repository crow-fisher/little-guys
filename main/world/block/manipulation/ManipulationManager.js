import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { copyMatValue } from "../../../util/matrix.js";
import { addVec3Mult, addVec3MultDest, addVec3MultFloor, addVectorsMult, copyVecValue, vec3Dot } from "../../../util/vector.js";

export class ManipulationManager {
    constructor(blockManager) {
        this.blockManager = blockManager;
        this.inputManager = blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.dimLeft = blockManager.sectorSize * 10;
        this.dimRight = blockManager.sectorSize * 10;
        this.dimUp = blockManager.sectorSize * 10;
        this.dimDown = blockManager.sectorSize * 10;

        this.centerCs = new CoordinateSet(this.cameraManager);
        this.upCs = new CoordinateSet(this.cameraManager);
        this.downCs = new CoordinateSet(this.cameraManager);
        this.leftCs = new CoordinateSet(this.cameraManager);
        this.rightCs = new CoordinateSet(this.cameraManager);

        this.cornerTlCs = new CoordinateSet(this.cameraManager);
        this.cornerTrCs = new CoordinateSet(this.cameraManager);
        this.cornerBlCs = new CoordinateSet(this.cameraManager);
        this.cornerBrCs = new CoordinateSet(this.cameraManager);

        this.initRefPoints();
    }

    initRefPoints() {
        this.refPoints = new Map();
        for (let i = -this.dimLeft; i < this.dimRight; i++) {
            this.refPoints.set(i, new Map());
            for (let j = -this.dimDown; j < this.dimUp; j++) {
                this.refPoints.get(i).set(j, new CoordinateSet(this.cameraManager));
                this.setRefPointCoordinates(this.refPoints.get(i).get(j), i, j);
            }
        }
    }

    setRefPointCoordinates(cs, i, j) {
        copyVecValue(this.centerCs.world, cs.world);
        addVec3Mult(cs.world, this.right, i);
        addVec3MultFloor(cs.world, this.up, j);
    }

    getClosestRefPoint(px, py) {
        let curCs, curDist, closestCs, closestDist = 10;
        for (let i = -this.dimLeft; i < this.dimRight; i++) {
            for (let j = -this.dimDown; j < this.dimUp; j++) {
                curCs = this.refPoints.get(i).get(j);
                curCs.process();
                curDist = ((px - curCs.renderScreen[0]) ** 2 + (py - curCs.renderScreen[1]) ** 2) ** 0.5;
                if (curDist < closestDist) {
                    closestCs = curCs;
                    closestDist = curDist;
                }
            }
        }
        return closestCs;


    }

    update() {
        if (this.inputManager.isPointerLocked() && this.inputManager.mouseManager.isButtonPressed(0)) {
            copyVecValue(this.cameraManager.right, this.right);
            copyVecValue(this.cameraManager.up, this.up);
            copyVecValue(this.cameraManager.forward, this.forward);
            copyVecValue(this.cameraManager.cameraOffset, this.centerCs.world);

            addVectorsMult(this.centerCs.world, this.cameraManager.forward, -100);

            copyVecValue(this.centerCs.world, this.upCs.world);
            copyVecValue(this.centerCs.world, this.downCs.world);
            copyVecValue(this.centerCs.world, this.leftCs.world);
            copyVecValue(this.centerCs.world, this.rightCs.world);

            addVectorsMult(this.leftCs.world, this.cameraManager.right, this.dimLeft);
            addVectorsMult(this.rightCs.world, this.cameraManager.right, -this.dimRight);
            addVectorsMult(this.upCs.world, this.cameraManager.up, this.dimUp);
            addVectorsMult(this.downCs.world, this.cameraManager.up, -this.dimDown);

            addVec3MultDest(this.leftCs.world, this.cameraManager.up, this.blockManager.sectorSize, this.cornerTlCs.world);
            addVec3MultDest(this.rightCs.world, this.cameraManager.up, this.blockManager.sectorSize, this.cornerTrCs.world);
            addVec3MultDest(this.leftCs.world, this.cameraManager.up, -this.blockManager.sectorSize, this.cornerBlCs.world);
            addVec3MultDest(this.rightCs.world, this.cameraManager.up, -this.blockManager.sectorSize, this.cornerBrCs.world);

            this.initRefPoints();
        }
        this.centerCs.process();
        this.upCs.process();
        this.downCs.process();
        this.leftCs.process();
        this.rightCs.process();

        this.cornerTlCs.process();
        this.cornerTrCs.process();
        this.cornerBlCs.process();
        this.cornerBrCs.process();

        if (!this.inputManager.isPointerLocked()) {
            // in case i lose it..https://www.quora.com/If-theres-a-point-inside-a-square-and-I-know-the-distances-between-the-point-and-the-corners-of-the-square-how-do-I-calculate-the-area
            this.hoverPos = this.inputManager.mouseManager.offset;
            this.hoverPoint = this.getClosestRefPoint(this.hoverPos.x, this.hoverPos.y);
            if (this.hoverPoint != null && this.inputManager.mouseManager.isButtonPressed(0)) {
                this.blockManager.addBlockAtRef(this.hoverPoint);
            }
        }
    }

    renderHoverPoint() {
        if (this.hoverPoint)
            renderPointLabel(
                this.canvasManager.context,
                ...this.hoverPoint.renderScreen,
                this._pSize / this.hoverPoint.distToCamera,
                hsvToHex(this.hoverPoint.distToCamera, 1, 1)
            )
    }

    renderCross() {
        this._pSize = 1000;
        this._lSize = 500;
        renderPointLabel(
            this.canvasManager.context,
            ...this.centerCs.renderScreen,
            this._pSize / this.centerCs.distToCamera,
            hsvToHex(180, 1, 1)
        )
        renderLine(
            this.canvasManager.context,
            this.centerCs.renderScreen,
            this.leftCs.renderScreen,
            this._lSize / this.leftCs.distToCamera,
            hsvToHex(180, 1, 1)
        );

        renderLine(
            this.canvasManager.context,
            this.centerCs.renderScreen,
            this.upCs.renderScreen,
            this._lSize / this.upCs.distToCamera,
            hsvToHex(180, 1, 1)
        );
        renderLine(
            this.canvasManager.context,
            this.centerCs.renderScreen,
            this.rightCs.renderScreen,
            this._lSize / this.rightCs.distToCamera,
            hsvToHex(180, 1, 1)
        );
        renderLine(
            this.canvasManager.context,
            this.centerCs.renderScreen,
            this.downCs.renderScreen,
            this._lSize / this.downCs.distToCamera,
            hsvToHex(180, 1, 1)
        );

        renderPointLabel(
            this.canvasManager.context,
            ...this.upCs.renderScreen,
            this._pSize / this.upCs.distToCamera,
            hsvToHex(0, 1, 1)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.downCs.renderScreen,
            this._pSize / this.downCs.distToCamera,
            hsvToHex(60, 1, 1)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.leftCs.renderScreen,
            this._pSize / this.leftCs.distToCamera,
            hsvToHex(120, 1, 1)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.rightCs.renderScreen,
            this._pSize / this.rightCs.distToCamera,
            hsvToHex(180, 1, 1)
        )
    }

    renderCorners() {
        renderPointLabel(
            this.canvasManager.context,
            ...this.cornerTlCs.renderScreen,
            this._pSize / this.cornerTlCs.distToCamera,
            hsvToHex(180, 0, .8)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.cornerTrCs.renderScreen,
            this._pSize / this.cornerTrCs.distToCamera,
            hsvToHex(180, 0, .8)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.cornerBlCs.renderScreen,
            this._pSize / this.cornerBlCs.distToCamera,
            hsvToHex(180, 0, .8)
        )
        renderPointLabel(
            this.canvasManager.context,
            ...this.cornerBrCs.renderScreen,
            this._pSize / this.cornerBrCs.distToCamera,
            hsvToHex(180, 0, .8)
        )
    }

    render() {
        this.renderCross();
        this.renderCorners();
        this.renderHoverPoint();
    }
}