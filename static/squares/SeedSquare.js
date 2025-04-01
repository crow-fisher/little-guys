import { BaseSquare } from "./BaseSqaure.js";
    
import { addOrganism } from "../organisms/_orgOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";
import { getSquares, removeOrganismSquare } from "./_sqOperations.js";
import { addOrganismSquare } from "../lifeSquares/_lsOperations.js";
class SeedSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SeedSquare";
        
        this.baseColor = "#0088FF";
        this.darkColor = "#00001D";
        this.accentColor = "#FF6A00";

        this.rootable = true;
        this.organic = true;
        this.visible = false;
    }
    gravityPhysics() {
        super.gravityPhysics();
        let sq = getSquares(this.posX, this.posY + 1)
            .find((sq) => sq.proto == "SoilSquare");
        if (sq == null) {
            let rockSq = getSquares(this.posX, this.posY + 1)
                .find((sq) => sq.proto == "RockSquare");
            if (rockSq != null) {
                this.destroy(true);
                return;
            }
            return;
        }

        if (this.linkedOrganism == null) {
            this.destroy();
            return;
        }

        let linkedOrganism = this.linkedOrganism;
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
            this.linkedOrganism.destroy();
            this.destroy();
        }
    }
}

export {SeedSquare}