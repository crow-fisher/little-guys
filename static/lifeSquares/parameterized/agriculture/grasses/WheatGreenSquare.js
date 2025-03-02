import { BaseLifeSquare } from "../../../BaseLifeSquare.js";
import { STATE_DEAD, STATE_THIRSTY, SUBTYPE_TRUNK, SUBTYPE_LEAF, SUBTYPE_NODE, SUBTYPE_SHOOT, SUBTYPE_SPROUT, SUBTYPE_STEM, SUBTYPE_FLOWER, SUBTYPE_FLOWERNODE } from "../../../../organisms/Stages.js";
import { addNewOrganism } from "../../../../organisms/_orgOperations.js";
import { WheatSeedOrganism } from "../../../../organisms/agriculture/WheatOrganism.js";
import { addSquare } from "../../../../squares/_sqOperations.js";
import { SeedSquare } from "../../../../squares/SeedSquare.js";

export class WheatGreenSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "WheatGreenSquare";
        this.type = "green";
        this.width = 1;
        this.activeRenderSubtype = null;
        this.LSQ_RENDER_SIZE_MULT = 1;
    }

    applySubtypeRenderConfig() {
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
                case SUBTYPE_FLOWERNODE:
                case SUBTYPE_FLOWER:
                    this.baseColor = "#668553";
                    this.darkColor = "#717A4A";
                    this.accentColor = "#525A2F";
                    this.width = 0.35 + 0.1 * Math.random();
                    break;
                case SUBTYPE_TRUNK:
                case SUBTYPE_SHOOT:
                case SUBTYPE_SPROUT:
                case SUBTYPE_STEM:
                case SUBTYPE_NODE:
                case SUBTYPE_LEAF:
                    this.baseColor = "#515c24";
                    this.darkColor = "#353b1a";
                    this.accentColor = "#5d6637";
                    break;
                default:
                    console.warn("Subtype doesn't have a display configuration!")
            }
        }
    }

    doGroundDecay() {
        if (this.subtype == SUBTYPE_FLOWER || this.subtype == SUBTYPE_FLOWERNODE) {
            let groundSquare = this.groundTouchSquare();
            let offsetY = 1;
            if (groundSquare.currentPressureDirect > 0) {
                offsetY += (groundSquare.currentPressureDirect + 1);
            }
            var sq = addSquare(new SeedSquare(groundSquare.posX, groundSquare.posY - offsetY));
            if (sq) {
                sq.opacity = 0;
                var orgAdded = addNewOrganism(new WheatSeedOrganism(sq));
                if (!orgAdded) {
                    sq.destroy();
                }
            }
        }

    }
}