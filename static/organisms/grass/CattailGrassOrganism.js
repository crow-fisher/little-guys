import { randNumber, randRange } from "../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_FLOWER, SUBTYPE_FLOWERTIP, SUBTYPE_GRASS, TYPE_GRASS } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../BaseOrganism.js";
import { UI_ORGANISM_GRASS_BASE, UI_ORGANISM_GRASS_CATTAIL } from "../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../BaseOrganism.js";
import { BaseGrassOrganism } from "./BaseGrassOrganism.js";

export let cattail_dnm = structuredClone(baseOrganism_dnm);
cattail_dnm[_llt_min] = 0.49;
cattail_dnm[_llt_max] = 1.29;
cattail_dnm[_llt_throttlValMax] = 5.35;
cattail_dnm[_seedReduction] = 0.08;
cattail_dnm[_waterPressureSoilTarget] = -2.07;
cattail_dnm[_waterPressureOverwaterThresh] = 1;
cattail_dnm[_waterPressureWiltThresh] = -.25;
cattail_dnm[_lightDecayValue] = 5.23;
cattail_dnm[_lightLevelDisplayExposureAdjustment] = -.37;


export class CattailGrassOrganism extends BaseGrassOrganism {
    constructor(square, parentId) {
        super(square, parentId);
        this.proto = "CattailGrassOrganism";
        this.uiRef = UI_ORGANISM_GRASS_CATTAIL;

        this.maxNumGrass = 2;
        this.maxGrassLength = 7;

        this.curNumGrass = 0;
        this.targetNumGrass = 0;
        this.targetGrassLength = 0;

        this.grasses = [];
    }

    getSeedType() {
        return CattailGrassSeedOrganism;
    }

    getDefaultNutritionMap() {
        return cattail_dnm;
    }

    processGenetics() {
        super.processGenetics();
        let p0 = this.evolutionParameters[0];
        this.maxNumGrass = 2;
        this.maxGrassLength = 10 + Math.floor(this.maxGrassLength * p0);
        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen / 4;
    }


    processLsqRendering() {
        if (!this.orgVisualUpdateFlag)
            return;

        let i = 0;

        if (this.originGrowth != null) {
            this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                grass.lifeSquares.forEach((lsq) => {
                    i += 1;
                    if (lsq.subtype == SUBTYPE_GRASS) {
                        lsq.width = .2 + .3 * Math.log(1 + grass.lifeSquares.length);
                        this.applyColor(this.colorLeaf, i, lsq.renderColor);
                    } else {
                        this.applyColor([84, 47, 31], i, lsq.renderColor);
                        if (lsq.subtype == SUBTYPE_FLOWERTIP) {
                            lsq.width = .2 + .25 * Math.log(1 + grass.lifeSquares.length);
                        } else {
                            lsq.width = .2 + .4 * Math.log(1 + grass.lifeSquares.length);
                        }
                    }
                });
            });

            if (this.grasses.length >= 2) {
                let grass = this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath)).at(1);
                let glsq = grass.lifeSquares;
                if (glsq.length < 9) {
                    return;
                }
                let min = glsq.length - 3;
                let max = glsq.length - 1;
                for (let i = 0; i < glsq.length; i++) {
                    if (i < min)
                        glsq[i].subtype = SUBTYPE_GRASS;
                    else if (i < max)
                        glsq[i].subtype = SUBTYPE_FLOWER;
                    else 
                        glsq[i].subtype = SUBTYPE_FLOWERTIP;
                }
            }
        }
    }

}

export class CattailGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, parentId) {
        super(square, evolutionParameters, parentId);
        this.proto = "CattailGrassSeedOrganism";
    }

    getSproutType() {
        return CattailGrassOrganism;
    }
    getSproutTypeProto() {
        return "CattailGrassOrganism";
    }
}