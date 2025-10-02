import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { calculateColor } from "../../climate/simulation/temperatureHumidity.js";
import { hexToRgb } from "../../common.js";
import { _lightDecayValue, _lightLevelDisplayExposureAdjustment, _llt_max, _llt_min, _llt_target, _llt_throttlValMax, _llt_throttlValMin, _seedReduction, _waterPressureOverwaterThresh, _waterPressureSoilTarget, _waterPressureWiltThresh, baseOrganism_dnm } from "../../organisms/BaseOrganism.js";
import { coneflower_dnm } from "../../organisms/flowers/ConeflowerOrganism.js";
import { cattail_dnm } from "../../organisms/grasses/CattailOrganism.js";
import { kblue_dnm } from "../../organisms/grasses/KentuckyBluegrassOrganism.js";
import { wheat_dnm } from "../../organisms/grasses/WheatOrganism.js";
import { pmoss_dnm } from "../../organisms/mosses/PleurocarpMossOrganism.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { RadioToggle } from "../elements/RadioToggle.js";
import { RadioToggleLabel } from "../elements/RadioToggleLabel.js";
import { RowedRadio } from "../elements/RowedRadio.js";
import { SliderGradientBackground } from "../elements/SliderGradientBackground.js";
import { SliderGradientBackgroundGetterSetter } from "../elements/SliderGradientBackgroundGetterSetter.js";
import { SliderGradientBackgroundPlantConfigurator } from "../elements/SliderGradientBackgroundPlantConfigurator.js";
import { Text } from "../elements/Text.js";
import { TextBackground } from "../elements/TextBackground.js";
import { TextFunctionalBackground } from "../elements/TextFunctionalBackground.js";
import { Toggle } from "../elements/Toggle.js";
import { ToggleFunctionalText } from "../elements/ToggleFunctionalText.js";
import { UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_WHEAT, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_CATTAIL, UI_CENTER, UI_ORGANISM_TREE_PALM, saveGD, UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_MOSS, UI_ORGANISM_TYPE_GRASS, UI_ORGANISM_TYPE_FLOWER, UI_ORGANISM_TYPE_TREE, loadGD, loadUI, UI_UI_PHONEMODE, UI_ORGANISM_FLOWER_CONEFLOWER, UI_ORGANISM_NUTRITION_CONFIGURATOR, UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA, addUIFunctionMap, UI_ORGANISM_MOSS_PLEUROCARP, UI_ORGANISM_CONFIGURATOR, UI_ORGANISM_TREE_MAGNOLIA } from "../UIData.js";

export class OrganismComponent extends Component {
     constructor(posX, posY, padding, dir, key) {
          super(posX, posY, padding, dir, key);
          let container = new Container(this.window, 0, 1);
          this.window.container = container;
          this.phoneModeOffset = 0;

          let sizeX = getBaseUISize() * 39;
          let half = sizeX / 2;
          let third = sizeX / 3;
          let quarter = sizeX / 4;
          let offsetX = getBaseUISize() * 0.8;

          let h1 = getBaseUISize() * 3;
          let h2 = getBaseUISize() * 2.5;
          let br1 = getBaseUISize() * .75;
          let br2 = getBaseUISize() * .5;
          let br3 = Math.round(getBaseUISize() * .25);

          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.75), 0.75, " "))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.66315, "plant editor"))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

          let modeSelectRow1 = new Container(this.window, 0, 0);
          let modeSelectRow2 = new Container(this.window, 0, 0);

          container.addElement(modeSelectRow1);
          container.addElement(modeSelectRow2);
          container.addElement(new TextBackground(this.window, sizeX, br2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));

          modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "mosses", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_MOSS,
               () => getActiveClimate().getUIColorInactiveCustom(0.57), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
          modeSelectRow1.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "grasses", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_GRASS,
               () => getActiveClimate().getUIColorInactiveCustom(0.61), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
          modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "flowers", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_FLOWER,
               () => getActiveClimate().getUIColorInactiveCustom(0.64), () => getActiveClimate().getUIColorInactiveCustom(0.50)));
          modeSelectRow2.addElement(new RadioToggleLabel(this.window, half, h1, offsetX, "trees", UI_ORGANISM_TYPE_SELECT, UI_ORGANISM_TYPE_TREE,
               () => getActiveClimate().getUIColorInactiveCustom(0.59), () => getActiveClimate().getUIColorInactiveCustom(0.50)));

          let mossConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_MOSS);
          let grassConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_GRASS);
          let flowerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_FLOWER);
          let treeConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_TREE);

          container.addElement(mossConditionalContainer);
          container.addElement(grassConditionalContainer);
          container.addElement(flowerConditionalContainer);
          container.addElement(treeConditionalContainer);
          // moss
          mossConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "moss", UI_ORGANISM_SELECT, UI_ORGANISM_MOSS_PLEUROCARP,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          
          let pleurocarpConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_MOSS_PLEUROCARP);
          mossConditionalContainer.addElement(pleurocarpConditionalContainer);
          
          
          pleurocarpConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "pleurocarp moss: the spready kind", "italic"))
          pleurocarpConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          pleurocarpConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "moist soils, shade"))

          // grass 
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "wheat", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_WHEAT,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "kentucky bluegrass", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_KBLUE,
               () => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorInactiveCustom(0.53)));
          grassConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "cattail", UI_ORGANISM_SELECT, UI_ORGANISM_GRASS_CATTAIL,
               () => getActiveClimate().getUIColorInactiveCustom(0.68), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          grassConditionalContainer.addElement(new TextBackground(this.window, sizeX, br2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))

          let wheatConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_WHEAT);
          let kblueConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_KBLUE);
          let cattailConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_GRASS_CATTAIL);

          grassConditionalContainer.addElement(wheatConditionalContainer);
          grassConditionalContainer.addElement(kblueConditionalContainer);
          grassConditionalContainer.addElement(cattailConditionalContainer);

          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "wheat: the cereal central to life", "italic"))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "drained soils, full sun"))
          wheatConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 2 cycles"))

          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "kentucky blue: a boring grass", "italic"))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "drained soils, partial sun"))
          kblueConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 1 cycle"))

          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "cattails: the forbidden corndogs", "italic"))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "wet soils, partial sun"))
          cattailConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 4 cycles"))
          // flower 
          flowerConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "coneflower", UI_ORGANISM_SELECT, UI_ORGANISM_FLOWER_CONEFLOWER,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          flowerConditionalContainer.addElement(new TextBackground(this.window, sizeX, br2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))

          let coneflowerConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_FLOWER_CONEFLOWER);
          flowerConditionalContainer.addElement(coneflowerConditionalContainer);

          coneflowerConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "coneflowers: darlings of the cone"))
          coneflowerConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          coneflowerConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "drained soils, partial sun"))
          coneflowerConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 1 cycle"))

          // tree
          treeConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "palm tree", UI_ORGANISM_SELECT, UI_ORGANISM_TREE_PALM,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));
          treeConditionalContainer.addElement(new RadioToggleLabel(this.window, sizeX, h1, offsetX, "magnolia", UI_ORGANISM_SELECT, UI_ORGANISM_TREE_MAGNOLIA,
               () => getActiveClimate().getUIColorInactiveCustom(0.60), () => getActiveClimate().getUIColorInactiveCustom(0.52)));

          let palmConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_SELECT) == UI_ORGANISM_TREE_PALM);
          treeConditionalContainer.addElement(palmConditionalContainer);
          treeConditionalContainer.addElement(new TextBackground(this.window, sizeX, br2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))

          palmConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "palms: technically grasses", "italic"))
          palmConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          palmConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.50), 0.75, "wet soils, full sun"))
          palmConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.55), 0.75, "growing time: 20 cycles"))

          // end

          let organismControlConditionalContainer = new ConditionalContainer(this.window, 0, 1, () => this.isOrganismSelectedOnCurrentPage());
          container.addElement(organismControlConditionalContainer);
          
          organismControlConditionalContainer.addElement(new TextBackground(this.window, sizeX, br2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          organismControlConditionalContainer.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.51), 0.75, "evolution parameters"))
          organismControlConditionalContainer.addElement(new TextBackground(this.window, sizeX, br3, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""))
          organismControlConditionalContainer.addElement(new TextBackground(this.window, sizeX, h2, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "target light level"))

          organismControlConditionalContainer.addElement(new SliderGradientBackgroundPlantConfigurator(this.window, sizeX, h1));

          // plant nutrition characteristic configurator
          organismControlConditionalContainer.addElement(new TextBackground(this.window, sizeX, br1, UI_CENTER, () => getActiveClimate().getUIColorInactiveCustom(0.85), 0.75, ""));
          organismControlConditionalContainer.addElement(new Toggle(this.window, sizeX, h1, UI_CENTER, UI_ORGANISM_NUTRITION_CONFIGURATOR, "configure nutrition",
                () => getActiveClimate().getUIColorInactiveCustom(0.63), () => getActiveClimate().getUIColorInactiveCustom(0.50)));

          let nutrientConfiguratorContainer = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR) && this.isOrganismSelectedOnCurrentPage());
          organismControlConditionalContainer.addElement(nutrientConfiguratorContainer);
          let left = sizeX * 0.8;
          let right = sizeX - left;

          let c_llt_target = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_llt_target);
          c_llt_target.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "llt_target"));
          c_llt_target.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_llt_target), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_llt_target), (val) => this.setGenericNutritionParam(_llt_target, val), sizeX, h1, .25, 4, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));

          let c_llt_min = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_llt_min);
          c_llt_min.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "llt_min"));
          c_llt_min.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_llt_min), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_llt_min), (val) => this.setGenericNutritionParam(_llt_min, val), sizeX, h1, .25, .85, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));

          let c_llt_max = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_llt_max);
          c_llt_max.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "llt_max"));
          c_llt_max.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_llt_max), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_llt_max), (val) => this.setGenericNutritionParam(_llt_max, val), sizeX, h1, 0, 3, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));

          let c_llt_tv_max = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_llt_tv_max);
          c_llt_tv_max.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "llt_throttlValMax"));
          c_llt_tv_max.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_llt_throttlValMax), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_llt_throttlValMax), (val) => this.setGenericNutritionParam(_llt_throttlValMax, val), sizeX, h1, 2, 8, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));

          let c_seedReduction = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_seedReduction);
          c_seedReduction.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "seedReduction"));
          c_seedReduction.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_seedReduction), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_seedReduction), (val) => this.setGenericNutritionParam(_seedReduction, val), sizeX, h1, 0.05, 0.95, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));
     
          let c_waterTarget = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_waterTarget);
          c_waterTarget.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "waterPressureTarget"));
          c_waterTarget.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_waterPressureSoilTarget), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_waterPressureSoilTarget), (val) => this.setGenericNutritionParam(_waterPressureSoilTarget, val), sizeX, h1, -10, 1, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));

          let c_overwaterThresh = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_overwaterThresh);
          c_overwaterThresh.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "overwaterThresh"));
          c_overwaterThresh.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_waterPressureOverwaterThresh), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_waterPressureOverwaterThresh), (val) => this.setGenericNutritionParam(_waterPressureOverwaterThresh, val), sizeX, h1, 0.1, 2, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));
     
          let c_wiltThresh = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_wiltThresh);
          c_wiltThresh.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "wiltThresh"));
          c_wiltThresh.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_waterPressureWiltThresh), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_waterPressureWiltThresh), (val) => this.setGenericNutritionParam(_waterPressureWiltThresh, val), sizeX, h1, -2, -.1, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));
                              
          let c_lightDecayValue = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_lightDecayValue);
          c_lightDecayValue.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "lightDecay"));
          c_lightDecayValue.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_lightDecayValue), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_lightDecayValue), (val) => this.setGenericNutritionParam(_lightDecayValue, val), sizeX, h1, -0.05, 8, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));
     
          let c_lightLevelDisplayExposureAdjustment = new Container(this.window, 0, 0);
          nutrientConfiguratorContainer.addElement(c_lightLevelDisplayExposureAdjustment);
          c_lightLevelDisplayExposureAdjustment.addElement(new TextBackground(this.window, left, h1, offsetX, () => getActiveClimate().getUIColorInactiveCustom(0.58), 0.75, "visual exposure offset"));
          c_lightLevelDisplayExposureAdjustment.addElement(new TextFunctionalBackground(this.window, right, h1, offsetX, () => this.getGenericNutritionParam(_lightLevelDisplayExposureAdjustment), () => getActiveClimate().getUIColorInactiveCustom(0.58)));
          nutrientConfiguratorContainer.addElement(new SliderGradientBackgroundGetterSetter(this.window,
               () => this.getGenericNutritionParam(_lightLevelDisplayExposureAdjustment), (val) => this.setGenericNutritionParam(_lightLevelDisplayExposureAdjustment, val), sizeX, h1, -2, 2, () => this.generalBrightnessFunc(0), () => this.generalBrightnessFunc(1)));
     

     }

     isOrganismSelectedOnCurrentPage() {
          let selected = loadGD(UI_ORGANISM_SELECT);
          if (loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_FLOWER) {
               if ([UI_ORGANISM_FLOWER_CONEFLOWER].includes(selected)) {
                    return true;
               }
               return false;
          }
          if (loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_MOSS) {
               if ([UI_ORGANISM_MOSS_PLEUROCARP].includes(selected)) {
                    return true;
               }
               return false;
          }
          if (loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_GRASS) {
               if ([UI_ORGANISM_GRASS_CATTAIL, UI_ORGANISM_GRASS_KBLUE, UI_ORGANISM_GRASS_WHEAT].includes(selected)) {
                    return true;
               }
               return false;
          }
          if (loadGD(UI_ORGANISM_TYPE_SELECT) == UI_ORGANISM_TYPE_TREE) {
               if ([UI_ORGANISM_TREE_PALM].includes(selected)) {
                    return true;
               }
               return false;
          }
     }

     generalBrightnessFunc(brightness) {
          return calculateColor(brightness, 0, 1, hexToRgb("#000000"), hexToRgb("#FFFFFF"));
     }

     getDefaultNutritionMap() {
          let activeOrganism = loadGD(UI_ORGANISM_SELECT);
          switch (activeOrganism) {
               case UI_ORGANISM_FLOWER_CONEFLOWER:
                    return coneflower_dnm;
               case UI_ORGANISM_GRASS_KBLUE:
                    return kblue_dnm;
               case UI_ORGANISM_GRASS_WHEAT:
                    return wheat_dnm;
               case UI_ORGANISM_GRASS_CATTAIL:
                    return cattail_dnm;
               case UI_ORGANISM_MOSS_PLEUROCARP:
                    return pmoss_dnm;
               default:
                    return baseOrganism_dnm;
          }
     }

     getGenericNutritionParam(name) {
          let defaultMap = this.getDefaultNutritionMap();
          let activeOrganism = loadGD(UI_ORGANISM_SELECT);

          let configMap = loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[activeOrganism];
          if (configMap == null || configMap[name] == null) {
               return defaultMap[name].toFixed(2);
          }
          return configMap[name].toFixed(2);
     }

     setGenericNutritionParam(name, value) {
          let activeOrganism = loadGD(UI_ORGANISM_SELECT);
          let configMap = loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[activeOrganism];
          if (configMap == null) {
               loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[activeOrganism] = {};
          }
          loadGD(UI_ORGANISM_NUTRITION_CONFIGURATOR_DATA)[activeOrganism][name] = value;
     }

     render() {
          if (loadUI(UI_UI_PHONEMODE)) {
               if (this.phoneModeOffset == 0) {
                    this.phoneModeOffset = getBaseUISize() * 3;
                    this.window.posY += this.phoneModeOffset;
               }
          } else {
               if (this.phoneModeOffset != 0) {
                    this.window.posY -= this.phoneModeOffset;
                    this.phoneModeOffset = 0;
               }
          };
          super.render();
     }
}