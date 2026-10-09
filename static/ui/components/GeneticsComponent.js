import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { hsvToHex } from "../../common.js";
import { BaseLeafNodeFlower } from "../../organisms/flowers/leafNode/BaseLeafNodeFlower.js";
import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { SliderGradientBackgroundRange } from "../elements/SliderGradientBackgroundRange.js";
import { TextBackground } from "../elements/TextBackground.js";
import { UI_CENTER } from "../UIData.js";

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

          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.75), 0.75, " "))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 3.8, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.55), 0.66315, "gene editor"))
          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, ""));

          this.refOrg = new BaseLeafNodeFlower();

          // It's a getter that is also a setter. "cursed shorthand"
          let ch = (r) => (v) => (v == null ? r : (r = v));

          container.addElement(new TextBackground(this.window, sizeX, getBaseUISize() * 0.35, UI_CENTER, () => getActiveClimate().getUIColorInactive(0.85), 0.75, "stem"));
          
          let s1 = [
               [ch(this.refOrg.stemThetaMin), ch(this.refOrg.stemThetaMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemTwistMin), ch(this.refOrg.stemTwistMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemRotationMin), ch(this.refOrg.stemRotationMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemDeflectionMin), ch(this.refOrg.stemDeflectionMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemCurveMin), ch(this.refOrg.stemCurveMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemStrengthMin), ch(this.refOrg.stemStrengthMax), 0, Math.PI * 2],
               [ch(this.refOrg.stemPeriodMin), ch(this.refOrg.stemPeriodMax), 0, Math.PI * 2],
          ]
          
          let h = 50, s, v, o = 0, i = 0;
          s1.forEach((row) => {
               s = .2 + .3 * Math.sin(o);
               v = .7 + .3 * Math.cos(o);
               let cmap = [() => hsvToHex(_h, _s, _v), () => hsvToHex(_h, 1 - _s, 0.4 + 0.4 * (1 - _v))];
               if (i % 2 == 0) {
                    cmap.reverse();
               }
               let _h = h, _s = s, _v = v;
               container.addElement(new SliderGradientBackgroundRange(this.window, row[0], row[1], sizeX, h1, row[2], row[3], ...cmap));
               h += 50;
               o += .2;
               i += 1;

          })

          console.log(this.refOrg.generateGeneticCode().serialize());
     }

}