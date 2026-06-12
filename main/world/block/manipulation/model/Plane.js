import { CoordinateSet } from "../../../../rendering/model/CoordinateSet.js";

export class Plane {
    constructor(manipulationManager, dimWidth=1, dimHeight=1) {
        this.manipulationManager = manipulationManager;
        this.inputManager = manipulationManager.blockManager.worldManager.mainManager.inputManager;
        this.cameraManager = manipulationManager.blockManager.worldManager.mainManager.cameraManager;
        this.canvasManager = manipulationManager.blockManager.worldManager.mainManager.canvasManager;
        this.rasterizationManager = manipulationManager.blockManager.worldManager.mainManager.rasterizationManager;

        this.right = [0, 0, 0];
        this.up = [0, 0, 0];
        this.forward = [0, 0, 0];

        this.dimWidth = dimWidth;
        this.dimHeight = dimHeight;

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

    initRefPoints() {
        this.refPoints = new Map();
        for (let i = 0; i < this.dimWidth; i += Math.max(1, Math.ceil(this.dimWidth / 100))) {
            this.refPoints.set(i, new Map());
            for (let j = 0; j < this.dimHeight; j += Math.max(1, Math.ceil(this.dimHeight / 100))) {
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
        let curCs, curDist, closestCs, closestDist = 100;
        for (let i = -this.dimLeft; i < this.dimRight; i += STEP) {
            for (let j = -this.dimDown; j < this.dimUp; j += STEP) {
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

    update() {}

    render() {}

    
}