import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hsvToHex } from "../../common.js";
import { BaseLeafNodeFlower } from "../../organisms/flowers/leafNode/BaseLeafNodeFlower.js";
import { ThetaMin, ThetaMax, TwistMin, TwistMax, RotationMin, RotationMax, DeflectionMin, DeflectionMax, CurveMin, CurveMax, StrengthMin, StrengthMax, PeriodMin, PeriodMax } from "../../organisms/GrowthPlan.js";
import { iterateOnOrganisms } from "../../organisms/orgOperations.js";
import { STAGE_DEAD } from "../../organisms/Stages.js";
import { Component } from "../Component.js";
import { ConditionalContainer } from "../ConditionalContainer.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { OrgColorEditor } from "../elements/OrgColorEditor.js";
import { SliderGradientBackgroundRange } from "../elements/SliderGradientBackgroundRange.js";
import { TextBackground } from "../elements/TextBackground.js";
import { TextBackgroundFunctional } from "../elements/TextBackgroundFunctional.js";
import { Toggle } from "../elements/Toggle.js";
import { loadGD, UI_CENTER, UI_COLORPICKER_COMPONENT } from "../UIData.js";

export class GeneticsComponent extends Component {
     constructor(posX, posY, padding, dir, key) {
          super(posX, posY, padding, dir, key);
          let container = new Container(this.window, 0, 1);
          this.window.container = container;
          this.phoneModeOffset = 0;

          let sizeX = getBaseUISize() * 39;
          let half = sizeX / 2;
          let third = sizeX / 3;
          let fourth = sizeX / 4;
          let fifth = sizeX / 5;
          let offsetX = getBaseUISize() * 0.8;

          let h1 = getBaseUISize() * 3;
          let h2 = getBaseUISize() * 2.5;
          let br1 = getBaseUISize() * .75;
          let br2 = getBaseUISize() * .5;
          let br3 = getBaseUISize() * .25;

          container.addElement(new TextBackground(this.window,2 * sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.75), 0.75, " "))
          container.addElement(new TextBackground(this.window,2 * sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.66315, "gene editor"))
          container.addElement(new TextBackground(this.window,2 * sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, ""));

          let r1 = new Container(this.window, 0, 0);

          container.addElement(r1);

          let r1c1 = new Container(this.window, 0, 1);
          let r1c2 = new Container(this.window, 0, 1);
          
          r1.addElement(r1c1);
          r1.addElement(r1c2);

          //////////////////////////// headers
          r1c1.addElement(new Button(this.window, sizeX, h1, UI_CENTER, () => this.refOrg = new BaseLeafNodeFlower(), "reset configurator", () => getActiveClimate().getUIColorInactive(0.55)));
          r1c2.addElement(new Button(this.window, sizeX, h1, UI_CENTER, () => iterateOnOrganisms((org) => org.stage = STAGE_DEAD), "kill all plants", () => getActiveClimate().getUIColorInactive(0.65)));

          //////////////////////////// left column
          this.refOrg = new BaseLeafNodeFlower();

          let s1 = [
               [ThetaMin, ThetaMax, -Math.PI, Math.PI],
               [TwistMin, TwistMax, 0, Math.PI],
               [RotationMin, RotationMax, 0, Math.PI],
               [DeflectionMin, DeflectionMax, 0, Math.PI],
               [CurveMin, CurveMax, 0, Math.PI],
               [StrengthMin, StrengthMax, 0, 1], 
               [PeriodMin, PeriodMax, 10, 200],
          ]

          let gc = this.refOrg.getGeneticsGrowthPlanConfig();
          Object.keys((gc)).forEach((key) => {
               r1c1.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, key));
               let h = 50, s, v, o = 0, i = 0;
               s1.forEach((row) => {
                    s = .2 + .3 * Math.sin(o);
                    v = .7 + .3 * Math.cos(o);
                    let cmap = [() => hsvToHex(_h, _s, _v), () => hsvToHex(_h, 1 - _s, 0.4 + 0.4 * (1 - _v))];
                    if (i % 2 == 0) {
                         cmap.reverse();
                    }
                    let _h = h, _s = s, _v = v;
                    r1c1.addElement(new SliderGradientBackgroundRange(this.window, this, key, row[0], row[1], sizeX, h1, row[2], row[3], ...cmap));
                    h += 50;
                    o += .2;
                    i += 1;
               })
          });

          r1c1.addElement(new Toggle(this.window, sizeX, h1, UI_CENTER, UI_COLORPICKER_COMPONENT, "colors", 
               () => getActiveClimate().getUIColorInactive(0.85), () => getActiveClimate().getUIColorInactive(0.65), 0.75));

          gc = this.refOrg.getGeneticsColorConfig();

          let ccc = new ConditionalContainer(this.window, 0, 1, () => loadGD(UI_COLORPICKER_COMPONENT));
          r1c1.addElement(ccc);

          Object.keys((gc)).forEach((key) => {
               ccc.addElement(new TextBackground(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, key));
               ccc.addElement(new OrgColorEditor(this.window, sizeX, h1 * 4, () => this.refOrg, gc[key]));
          });
          
          //////////////////////////// right column  

          let rWidth = 27;
          for (let i = 0; i < 30; i++) {
               r1c2.addElement(new TextBackgroundFunctional(this.window, sizeX, h1, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85 + 0.1 * (i % 2 - 3)),  0.75, () => this.refOrg.generateGeneticCode().serialize().slice(i * rWidth, (i + 1) * rWidth)));
          }
     }

}