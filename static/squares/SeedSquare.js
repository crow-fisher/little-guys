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

        this.baseColor = "#0088FF";
        this.darkColor = "#00001D";
        this.accentColor = "#FF6A00";

        this.nutrientValue = dirtNutrientValuePerDirectNeighbor;
        this.rootable = true;
        this.organic = true;
        this.visible = false;
    }
    physics() {
        super.physics();
        getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.rootable)
            .forEach((sq) => {
                var linkedOrganism = this.linkedOrganism;
                if (sq.linkedOrganism == null) {
                    removeOrganism(linkedOrganism);
                    linkedOrganism.posY += 1;
                    linkedOrganism.linkSquare(sq);
                    addOrganism(linkedOrganism);

                    linkedOrganism.lifeSquares.forEach((lsq) => {
                        removeOrganismSquare(lsq);
                        lsq.posY += 1;
                        addOrganismSquare(lsq);
                        lsq.linkSquare(sq);
                    });
                    this.destroy();
                } else {
                    console.log("Already found an organism here: ", this.posX, this.posY + 1);
                    this.linkedOrganism.destroy();
                }
            });
        
        getSquares(this.posX, this.posY + 1)
        .filter((sq) => !sq.validPlantHome)
        .filter((sq) => sq.solid)
        .forEach((sq) => {
            if (this.linkedOrganism != null) {
                this.linkedOrganism.destroy();
            }
        });
    }
}

export {SeedSquare}