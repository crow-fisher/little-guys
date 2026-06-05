import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { renderLine, renderPointLabel } from "../../../rendering/renderFunctions.js";
import { copyMatValue } from "../../../util/matrix.js";
import { addVectorsMult, copyVecValue } from "../../../util/vector.js";

export class ManipulationManager {
    constructor(blockManager) {
        this.blockManager = blockManager;
        this.inputManager = blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.centerCs = new CoordinateSet(this.cameraManager);

        this.upCs = new CoordinateSet(this.cameraManager);
        this.downCs = new CoordinateSet(this.cameraManager);
        this.leftCs = new CoordinateSet(this.cameraManager);
        this.rightCs = new CoordinateSet(this.cameraManager);
    }

    update() {
        if (this.inputManager.isPointerLocked() && this.inputManager.mouseManager.isButtonPressed(0)) {

            copyVecValue(this.cameraManager.cameraOffset, this.centerCs.world);
            addVectorsMult(this.centerCs.world, this.cameraManager.forward, -100);

            copyVecValue(this.centerCs.world, this.upCs.world);
            copyVecValue(this.centerCs.world, this.downCs.world);
            copyVecValue(this.centerCs.world, this.leftCs.world);
            copyVecValue(this.centerCs.world, this.rightCs.world);

            addVectorsMult(this.leftCs.world, this.cameraManager.right, this.blockManager.sectorSize);
            addVectorsMult(this.rightCs.world, this.cameraManager.right, -this.blockManager.sectorSize);
            addVectorsMult(this.upCs.world, this.cameraManager.up, this.blockManager.sectorSize);
            addVectorsMult(this.downCs.world, this.cameraManager.up, -this.blockManager.sectorSize);
        }
        this.centerCs.process();
        this.upCs.process();
        this.downCs.process();
        this.leftCs.process();
        this.rightCs.process();
    }

    render() {
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
}