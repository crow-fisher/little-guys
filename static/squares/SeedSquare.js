import { BaseSquare } from "./BaseSqaure.js";
    
import { addOrganism } from "../organisms/_orgOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";
import { getSquares } from "./_sqOperations.js";
import { randRange } from "../common.js";
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
        this.gravity = randRange(4, 16);
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
        if (this.linkedOrganisms.length == 0) {
            this.destroy();
            return;
        }
        this.linkedOrganisms.forEach((org) => {
            removeOrganism(org);
            org.posY += 1;
            org.linkSquare(sq);
            addOrganism(org);
        });
    }
}

export {SeedSquare}