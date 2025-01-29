import { getDirectNeighbors } from "../../squares/_sqOperations.js";
import { BaseLifeSquare } from "../BaseLifeSquare.js";

export class GenericParameterizedRootSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "GenericParameterizedRootSquare";
        this.type = "root";
        this.opacity = this.linkedOrganism.rootOpacity;
        this.colorBase = "#D1E231";
    }
}