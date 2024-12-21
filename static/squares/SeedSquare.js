import { BaseSquare } from "./BaseSqaure.js";
import {
    dirtNutrientValuePerDirectNeighbor
    } from "../config/config.js"
    
    import { addOrganism, getOrganismsAtSquare } from "../organisms/_orgOperations.js";
    import { removeOrganism } from "../organisms/_orgOperations.js";
    import { removeSquare } from "../globalOperations.js";
    import { getObjectArrFromMap } from "../common.js";
    import { addSquare, getSquares, removeOrganismSquare } from "./_sqOperations.js";
    import { ALL_ORGANISMS } from "../globals.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
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
            .forEach((sq) => {
                var organismsBelow = getOrganismsAtSquare(sq.posX, sq.posY);
                var linkedOrganism = this.linkedOrganism;
                if (organismsBelow.length == 0) {
                    
                    removeOrganism(linkedOrganism);
                    linkedOrganism.posY += 1;
                    linkedOrganism.linkSquare(sq);
                    addOrganism(linkedOrganism);

                    linkedOrganism.lifeSquares.forEach((lsq) => {
                        removeOrganismSquare(lsq);
                        lsq.posY += 1;
                        lsq.linkSquare(sq);
                        addOrganismSquare(lsq);
                    });

                    this.destroy();
                } else {
                    this.linkedOrganism.destroy();
                    this.destroy();
                }
            });

    }
}

export {SeedSquare}