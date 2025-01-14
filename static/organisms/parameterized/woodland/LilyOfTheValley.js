import { LilyOfTheValleyGreenSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyGreenSquare.js";
import { LilyOfTheValleyRootSquare } from "../../../lifeSquares/parameterized/woodland/LilyOfTheValleyRootSquare.js";
import { BaseParameterizedOrganism } from "../BaseParameterizedOrganism.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT } from "../Stages.js";

export class LilyOfTheValleyOrganism extends BaseParameterizedOrganism {
    constructor(posX, posY) {
        super(posX, posY);
        this.greenType = LilyOfTheValleyGreenSquare;
        this.rootType = LilyOfTheValleyRootSquare;
    }
}