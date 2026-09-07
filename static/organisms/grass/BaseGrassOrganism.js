import { randNumber, randRange } from "../../common.js";
import { STAGE_ADULT, STAGE_FLOWER, SUBTYPE_GRASS, TYPE_GRASS } from "../Stages.js";
// import { GrowthPlan, GrowthPlanStep } from "../../../GrowthPlan.js";
import { GrowthPlan, GrowthPlanStep } from "../GrowthPlan.js";
import { BaseSeedOrganism } from "../BaseSeedOrganism.js";
import { _lightLevelDisplayExposureAdjustment, _llt_mult, BaseOrganism, baseOrganism_dnm } from "../BaseOrganism.js";
import { UI_ORGANISM_GRASS_BASE } from "../../ui/UIData.js";
import { _lightDecayValue, _llt_max, _llt_min, _llt_throttlValMax, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh } from "../BaseOrganism.js";

export let grass_dnm = structuredClone(baseOrganism_dnm);
grass_dnm[_llt_mult] = 1.45;
grass_dnm[_llt_min] = 0.74;
grass_dnm[_llt_max] = 1.43;
grass_dnm[_llt_throttlValMax] = 5.27;
grass_dnm[_seedReduction] = 0.10;
grass_dnm[_waterPressureSoilTarget] = -4;
grass_dnm[_waterPressureOverwaterThresh] = 1;
grass_dnm[_waterPressureWiltThresh] = -1.5;
grass_dnm[_lightDecayValue] = 4.42;
grass_dnm[_lightLevelDisplayExposureAdjustment] = .22;

export class BaseGrassOrganism extends BaseOrganism {
    constructor(square, parentId) {
        super(square, parentId);
        this.proto = "BaseGrassOrganism";
        this.uiRef = UI_ORGANISM_GRASS_BASE;

        this.maxNumGrass = 2;
        this.maxGrassLength = 5;

        this.curNumGrass = 0;
        this.targetNumGrass = 0;
        this.targetGrassLength = 0;

        this.grasses = [];
    }

    getSeedType() {
        return BaseGrassSeedOrganism;
    }

    getDefaultNutritionMap() {
        return grass_dnm;
    }

    processGenetics() {
        super.processGenetics();
        let p0 = this.evolutionParameters[0];
        this.maxNumGrass = randNumber(3, 5);
        this.maxGrassLength = this.maxGrassLength + Math.floor(this.maxGrassLength * p0);

        this.growthNumGreen = this.maxNumGrass * this.maxGrassLength;
        this.growthNumRoots = this.growthNumGreen;
    }

    processLsqRendering() {
        if (!this.orgVisualUpdateFlag)
            return;
        this.grasses.map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .forEach((grass) => {
                let l = grass.lifeSquares.length;
                let i = 0;
                grass.lifeSquares.forEach((lsq) => {
                    lsq.width = .3 + .3 * Math.log(3 + l - i);
                    i += 1;
                    this.applyColor(this.colorLeaf, i, lsq.renderColor);
                });
                grass.lifeSquares[0].theta = grass.lifeSquares[1]?.theta ?? grass.lifeSquares[0].theta;
            })
    }

    growGrass() {
        if (this.curNumGrass > (this.curNumRoots / 2)) {
            return;
        }
        let startRootNode = this.getRootOrigin()
        let baseDeflection = randRange(0, .15);
        let growthPlan = new GrowthPlan(
            startRootNode.posX, startRootNode.posY, 
            false, STAGE_ADULT, randRange(-Math.PI, Math.PI), baseDeflection, 
            0, baseDeflection, randRange(0, .15),
            TYPE_GRASS, .055, 15);

        growthPlan.postConstruct = () => {
            this.originGrowth.addChild(growthPlan.component);
            this.grasses.push(this.originGrowth.getChildPath(growthPlan.component))
        };
        growthPlan.steps.push(new GrowthPlanStep(
            growthPlan,
            () => this.growGreenSquareAction(startRootNode, SUBTYPE_GRASS)
        ))
        this.growthPlans.push(growthPlan);
        this.curNumGrass += 1;
    }

    lengthenGrass() {
        this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .filter((grass) => grass.growthPlan.steps.length < this.targetGrassLength)
            .forEach((grass) => {
                let startNode = grass.lifeSquares.find((lsq) => lsq.subtype == SUBTYPE_GRASS);
                if (startNode == null) {
                    this.growthPlans = Array.from(this.growthPlans.filter((gp) => gp != grass.growthPlan));
                    this.grasses = Array.from(this.grasses.filter((le) => this.originGrowth.getChildFromPath(le) != grass));
                    this.curNumGrass -= 1;
                    return;
                }
                for (let i = 0; i < this.targetGrassLength - grass.growthPlan.steps.length; i++) {
                    grass.growthPlan.steps.push(new GrowthPlanStep(
                        grass.growthPlan,
                        () => this.growGreenSquareAction(startNode, SUBTYPE_GRASS)
                    ))
                };
            });
    }

    planGrowth() {
        if (!super.planGrowth()) {
            return;
        }

        if (this.grasses
            .map((parentPath) => this.originGrowth.getChildFromPath(parentPath))
            .some((grass) => grass.growthPlan.steps.length < this.targetGrassLength)) {
            this.lengthenGrass();
            return;
        }

        if (this.targetGrassLength < (this.maxGrassLength / 2)) {
            this.targetGrassLength += 1;
            return;
        }

        if (this.targetNumGrass < this.maxNumGrass) {
            this.targetNumGrass += 1;
            return;
        }

        if (this.curNumGrass < this.targetNumGrass) {
            this.growGrass();
            return;
        }
        if (this.targetGrassLength < this.maxGrassLength) {
            this.targetGrassLength += 1;
            return;
        }
    }
}

export class BaseGrassSeedOrganism extends BaseSeedOrganism {
    constructor(square, evolutionParameters, parentId) {
        super(square, evolutionParameters, parentId);
        this.proto = "BaseGrassSeedOrganism";
    }

    getSproutType() {
        return BaseGrassOrganism;
    }
    getSproutTypeProto() {
        return "BaseGrassOrganism";
    }
}