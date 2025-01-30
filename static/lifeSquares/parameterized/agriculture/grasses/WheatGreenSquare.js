getNeighbors
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_DEAD, SUBTYPE_LEAF, SUBTYPE_LEAFSTEM, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_TRUNK } from "../../../../organisms/parameterized/Stages.js";

import { hexToRgb } from "../../../../common.js";
import { getNeighbors } from "../../../../squares/_sqOperations.js";
import { BaseLifeSquare } from "../../../BaseLifeSquare.js";
import { airNutrientsPerEmptyNeighbor } from "../../../../config/config.js";

export class WheatGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "WheatGreenSquare";
        this.type = "green";
        this.width = 0.7;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
    }


    subtypeColorUpdate() {
        if (this.state == STATE_DEAD) {
            this.baseColor = "#70747e";
            this.darkColor = "#a1816d";
            this.accentColor = "#33261d";
        } else if (this.state == STATE_THIRSTY) {
            this.baseColor = "#6a7831";
            this.darkColor = "#4a5226";
            this.accentColor = "#67703f";
        } else {
            switch (this.subtype) {
                case SUBTYPE_TRUNK:
                case SUBTYPE_SHOOT:
                case SUBTYPE_SPROUT:
                case SUBTYPE_STEM:
                case SUBTYPE_NODE:
                    this.baseColor = "#515c24";
                    this.darkColor = "#353b1a";
                    this.accentColor = "#5d6637";
                    break;
                case SUBTYPE_DYING:
                    this.baseColor = "#ab8e56";
                    this.darkColor = "#ccab78";
                    this.accentColor = "#836131";
                case SUBTYPE_DEAD:
                    this.baseColor = "#70747e";
                    this.darkColor = "#a1816d";
                    this.accentColor = "#33261d";
                    break;
                default:
                    console.warn("BIPPITY BOPPITY")
            }
        }
        this.activeRenderSubtype = this.subtype;
        this.activeRenderState = this.state;
        this.baseColor_rgb = hexToRgb(this.baseColor);
        this.darkColor_rgb = hexToRgb(this.darkColor);
        this.accentColor_rgb = hexToRgb(this.accentColor);
    }

    preTick() {
        if (this.activeRenderSubtype != this.subtype || this.activeRenderState != this.state) {
            this.subtypeColorUpdate();
        }
    }

    tick() {
        this.addAirNutrient(
            airNutrientsPerEmptyNeighbor.value *
            (
                8 - getNeighbors(this.posX, this.posY)
                    .filter((sq) => !sq.surface)
                    .map((sq) => 1)
                    .reduce(
                        (accumulator, currentValue) => accumulator + currentValue,
                        0,
                    ))
        );
    }
}