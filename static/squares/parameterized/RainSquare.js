import { addSquare, getSquares } from "../_sqOperations.js";
import { WaterSquare } from "../WaterSquare.js";
import { randNumber } from "../../common.js";
import { RockSquare } from "./RockSquare.js";

class AquiferSquare extends RockSquare {
    constructor(posX, posY) { 
        super(posX, posY);
        this.baseColor = "#E5E4E2";
        this.darkColor = "#C0C0C0";
        this.accentColor = "#708090";
        this.physicsEnabled = false;
        this.collision = false;
        this.proto = "AquiferSquare";
        this.waterContainmentMax = 1;
        this.waterContainmentTransferRate = 0;
        this.opacity = 0.03;
        this.special = true;
    }
    physics() {
        if (getSquares(this.posX, this.posY + 1).length == 0) {
            var sq = addSquare(new WaterSquare(this.posX, this.posY + 1));
            if (sq) {
                sq.speedX = randNumber(-2, 2);
                sq.temperature = this.temperature;
            }
        }
    }
    render() {
        if (!this.visible) {
            return;
        }
        this.renderWithVariedColors();
    }
}

export {AquiferSquare}