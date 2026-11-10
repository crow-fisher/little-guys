import { rgbToRgba } from "../../../../color/color.js";
import { hsvaToRgba, rgb2hsv } from "../../../../common.js";
import { clamp } from "../../../../util/func.js";
import { addVectors, multiplyVectorByScalarCopy } from "../../../../util/vector.js";
import { Square } from "./Square.js";

export class LiveSquare extends Square {
    constructor(posX, posY, materialConfig) {
        super(posX, posY);
        this.PID = 1;
        this.colorBaseArr = [[[201, 144, 98], [61, 45, 33], [139, 76, 51]], [[60, 71, 134], [3, 0, 3], [130, 130, 151]]];
        this.processMaterialConfig(materialConfig);
        this.randomize();
        this.processColor();
    }
    update(box, planeManager) {
        this.gravityPhysics(box, planeManager);
    }
    render(planeManager) {
        super.render(planeManager);
    }

    processMaterialConfig(materialConfig) {
        this.type = materialConfig.type;
        this.sand = materialConfig.sand;
        this.silt = materialConfig.silt;
        this.clay = materialConfig.clay;
        this.offsetHue = materialConfig.offsetHue;
        this.offsetSaturation = materialConfig.offsetSaturation;
        this.offsetValue = materialConfig.offsetValue;
    }

    processColor() {
        this.colorSand = multiplyVectorByScalarCopy(this.colorBaseArr[this.type][0], this.sand);
        this.colorSilt = multiplyVectorByScalarCopy(this.colorBaseArr[this.type][1], this.silt);
        this.colorClay = multiplyVectorByScalarCopy(this.colorBaseArr[this.type][2], this.clay);
        this.colorRaw = [
            this.colorSand[0] + this.colorSilt[0] + this.colorClay[0],
            this.colorSand[1] + this.colorSilt[1] + this.colorClay[1],
            this.colorSand[2] + this.colorSilt[2] + this.colorClay[2]
        ]
        this.colorHsv = rgb2hsv(...this.colorRaw)
        this.colorHsvAdj = addVectors(this.colorHsv, [this.offsetHue, this.offsetSaturation, this.offsetValue]);
        this.renderColor = rgbToRgba(...hsvaToRgba(...this.colorHsvAdj, 1, 1))
    }

    randomize() {
        let rand1 = (Math.random() - 0.5) * 0.4;
        let rand2 = (Math.random() - 0.5) * 0.4;
        let rand3 = (Math.random() - 0.5) * 0.4;
        this.clay *= (1 + rand1);
        this.silt *= (1 + rand2);
        this.sand *= (1 + rand3);
        let sum = this.clay + this.silt + this.sand;
        this.clay *= (1 / sum);
        this.silt *= (1 / sum);
        this.sand *= (1 / sum);
        this.clay = clamp(this.clay);
        this.silt = clamp(this.silt, 0, 1 - this.clay);
        this.sand = 1 - (this.clay + this.silt);

    }

    gravityPhysics(box, plane) {
        if (this.type == 1) {
            return;
        }
        let nbBot = box.nbBot(plane, true);
        if (nbBot.squares[this.PID] == null) {
            box.squares[this.PID] = null;
            nbBot.squares[this.PID] = this;
            this.posY += 1;
        }


    }

}   