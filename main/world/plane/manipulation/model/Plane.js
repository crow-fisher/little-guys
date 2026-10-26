import { Box } from "./Box.js";

export class Plane {
    constructor(manipulationManager) {
        this.manipulationManager = manipulationManager;
        this.offsetX = 0;
        this.offsetY = 0;
        this.blockSize = 8;
    }

    addSquare(square) {
        this.boxes.set(this.boxes.get(square.posX), new Map());
        this.boxes.get(square.posX).set(square.posY, this.boxes.get(square.posX).get(square.posY) ?? new Box());
        this.boxes.get(square.posX).get(square.posY).addSquare(square);
    }
}