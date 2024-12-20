import { BaseSquare } from "./BaseSqaure.js";
import {
    dirtNutrientValuePerDirectNeighbor
    } from "../config/config.js"
    
    import { getOrganismsAtSquare } from "../organisms/_orgOperations.js";
    import { removeOrganism } from "../organisms/_orgOperations.js";
    import { removeSquareAndChildren } from "../globalOperations.js";
    import { getObjectArrFromMap } from "../common.js";
    import { getSquares } from "./_sqOperations.js";
    import { ALL_ORGANISMS } from "../globals.js";
class SeedSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SeedSquare";
        this.colorBase = "#709775";
        this.nutrientValue = dirtNutrientValuePerDirectNeighbor;
        this.rootable = true;
        this.organic = true;
    }
    physics() {
        super.physics();

        getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.rootable)
            .forEach((sqBelow) => {
                var organismsBelow = getOrganismsAtSquare(sqBelow.posX, sqBelow.posY) ;
                if (organismsBelow.length == 0) {
                    getOrganismsAtSquare(this.posX, this.posY).forEach((org) => {
                        removeOrganism(org);
                        org.posY += 1;
                        org.associatedSquares.forEach((sq) => sq.posY += 1);
                        getObjectArrFromMap(ALL_ORGANISMS, org.posX, org.posY).push(org);
                    });
                }
                removeSquareAndChildren(this);
            })
    }
}

export {SeedSquare}