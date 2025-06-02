import { BaseSquare } from "./BaseSqaure.js";
    
import { addOrganism } from "../organisms/_orgOperations.js";
import { removeOrganism } from "../organisms/_orgOperations.js";
import { getSquares } from "./_sqOperations.js";
import { randRange } from "../common.js";
import { getWindSpeedAtLocation } from "../climate/simulation/wind.js";
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
        this.rockable = false;
        this.gravity = randRange(4, 8);
    }
    gravityPhysics() {
        super.gravityPhysics();

        if (this.linkedOrganisms.length == 0) {
            this.destroy();
            return;
        }

        let rockable = this.linkedOrganisms.at(0).rockable;
        
        let sq = getSquares(Math.round(this.posX), Math.round(this.posY + 1))
            .find((sq) => (rockable ? (sq.proto == "SoilSquare" || sq.proto == "RockSquare") : sq.proto == "SoilSquare"));
        if (sq == null) {
            let rockSq = getSquares(this.posX, this.posY + 1)
                .find((sq) => sq.proto == "RockSquare");
            if (rockSq != null) {
                this.destroy(true);
                return;
            }
            this.seedWindPhysics();
            return;
        }

        this.updatePosition(Math.round(this.posX), Math.round(this.posY));
        
        if (sq.linkedOrganismSquares.some((lsq) => {
            let myOrg = this.linkedOrganisms.at(0);
            return lsq.proto == myOrg.getSproutTypeProto();
        })) {
            this.destroy(true);
            console.log("Destroying; found a root or something here that")
            return;
        } 

        this.linkedOrganisms.forEach((org) => {
            removeOrganism(org);
            org.posY += 1;
            org.linkSquare(sq);
            addOrganism(org);
        });
    }

    seedWindPhysics() {
        let windSpeed = getWindSpeedAtLocation(this.posX, this.posY);
        this.speedX += .1 * windSpeed[0];
        this.speedY += .1 * windSpeed[1];
    }
}

export {SeedSquare}