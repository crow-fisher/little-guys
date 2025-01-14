import { BaseSeedOrganism } from "../../BaseSeedOrganism.js";
import { LilyOfTheValleyOrganism } from "./LilyOfTheValley.js";

export class LilyOfTheValleySeedOrganism extends BaseSeedOrganism {
    constructor(square) {
        super(square);
        this.proto = "LilyOfTheValleySeedOrganism";
        this.sproutCtor = (linkedSquare) => new LilyOfTheValleyOrganism(linkedSquare)
    }
}