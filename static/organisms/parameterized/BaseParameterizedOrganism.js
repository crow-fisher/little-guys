import { randNumber } from "../../common.js";
import { addOrganismSquare, getOrganismSquaresAtSquareWithEntityId } from "../../lifeSquares/_lsOperations.js";
import { addSquare, getDirectNeighbors } from "../../squares/_sqOperations.js";
import { SoilSquare } from "../../squares/parameterized/SoilSquare.js";
import { PlantSquare } from "../../squares/PlantSquare.js";
import { getCurDay, getPrevDay } from "../../time.js";
import { addNewOrganism } from "../_orgOperations.js";
import { BaseOrganism } from "../BaseOrganism.js";
import { GrowthPlan, GrowthPlanStep } from "./GrowthPlan.js";
import { STAGE_ADULT, STAGE_FLOWER, STAGE_FRUIT, STAGE_JUVENILE, STAGE_SPROUT, STATE_DEAD, STATE_HEALTHY, STATE_THIRSTY, SUBTYPE_DEAD, SUBTYPE_ROOTNODE, SUBTYPE_SPROUT, TYPE_HEART, TYPE_TRUNK } from "./Stages.js";

