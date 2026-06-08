import { hsvToHex } from "../../../color/color.js";
import { CoordinateSet } from "../../../rendering/model/CoordinateSet.js";
import { renderPointLabel } from "../../../rendering/renderFunctions.js";

export class Block {
    constructor(blockManager, cartesian) {
        this.blockManager = blockManager;
        this.cameraManager = blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = blockManager.worldManager.mainManager.canvasManager;

        this.cartesian = cartesian;
        this.cs = new CoordinateSet(this.cameraManager, this.cartesian);
        this.sector = blockManager.cartesianToSector(cartesian);
    }

    update() {
        this.cs.process()
    }

    render() {
        renderPointLabel(
            this.canvasManager.context,
            ...this.cs.renderScreen,
            1000 / this.cs.distToCamera,
            hsvToHex(this.cs.distToCamera, 1, .8)
        )
    }
}