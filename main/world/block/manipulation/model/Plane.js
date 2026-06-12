import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.inputManager = manipulationManager.blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = manipulationManager.blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = manipulationManager.blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = manipulationManager.blockManager.worldManager.mainManager.rasterizationManager;

        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.dimLeft = blockManager.sectorSize * 3;
        this.dimRight = blockManager.sectorSize * 3;
        this.dimUp = blockManager.sectorSize * 3;
        this.dimDown = blockManager.sectorSize * 3;

        this.centerCs = new CoordinateSet(this.cameraManager);
        this.upCs = new CoordinateSet(this.cameraManager);
        this.downCs = new CoordinateSet(this.cameraManager);
        this.leftCs = new CoordinateSet(this.cameraManager);
        this.rightCs = new CoordinateSet(this.cameraManager);

        this.cornerTlCs = new CoordinateSet(this.cameraManager);
        this.cornerTrCs = new CoordinateSet(this.cameraManager);
        this.cornerBlCs = new CoordinateSet(this.cameraManager);
        this.cornerBrCs = new CoordinateSet(this.cameraManager);
    }
}