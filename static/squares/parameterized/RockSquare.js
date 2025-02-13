
import { getSquares } from "../_sqOperations.js";
import { hexToRgb } from "../../common.js";
import { addSquareByName, CANVAS_SQUARES_Y } from "../../index.js";
import { SoilSquare } from "./SoilSquare.js";
import { getRockLightDecayFactor } from "../../lighting.js";

export class RockSquare extends SoilSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "RockSquare";
        this.gravity = 0;

        this.clayColorRgb = hexToRgb("#ba9670");
        this.siltColorRgb = hexToRgb("#664935");
        this.sandColorRgb = hexToRgb("#988570");

        this.sand = Math.random() * 1.00;
        this.silt = Math.random() * 0.80;
        this.clay = Math.random() * 0.20;

        var sum = this.clay + this.silt + this.sand;

        this.clay *= (1 / sum);
        this.silt *= (1 / sum);
        this.sand *= (1 / sum);

        this.clay = Math.min(Math.max(this.clay, 0), 1);
        this.silt = Math.min(Math.max(this.silt, 0), 1);
        this.sand = Math.min(Math.max(this.sand, 0), 1);
    }
    initWaterContainment() {
        this.waterContainment = 0;
    }

    lightFilterRate() {
        return super.lightFilterRate() * getRockLightDecayFactor();
    }

    getWaterflowRate() {
        var base = super.getWaterflowRate();
        return base * 100;
    }

    doBlockOutflow() {
        super.doBlockOutflow();
        var thisWaterPressure = this.getMatricPressure(); 
        if (thisWaterPressure < -2) {
            return;
        }

        if (getSquares(this.posX, this.posY + 1).some((sq) => sq.collision)) {
            return;
        }

        var pressureToOutflowWaterContainment = this.getInverseMatricPressure(thisWaterPressure + 2);
        var diff = (this.waterContainment - pressureToOutflowWaterContainment) / this.getWaterflowRate();
        diff *= Math.abs(thisWaterPressure - -2);
        if ((this.posY + 1) >= CANVAS_SQUARES_Y) {
            this.waterContainment -= diff;
        } else {
            var newWater = addSquareByName(this.posX, this.posY + 1, "water");
            if (newWater) {
                newWater.blockHealth = diff;
                this.waterContainment -= diff;
            }
        }
    }
}