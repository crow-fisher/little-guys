import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
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
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemThetaMin), ch(this.refOrg.stemThetaMax), sizeX, h1, 0, Math.PI, () => "#9b9b9b", () => "#566b68"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemTwistMin), ch(this.refOrg.stemTwistMax), sizeX, h1, 0, Math.PI, () => "#56666b", () => "#5a99ac"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemRotationMin), ch(this.refOrg.stemRotationMax), sizeX, h1, 0, Math.PI, () => "#99aac5", () => "#2d466e"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemDeflectionMin), ch(this.refOrg.stemDeflectionMax), sizeX, h1, 0, Math.PI, () => "#8681b3", () => "#38307e"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemCurveMin), ch(this.refOrg.stemCurveMax), sizeX, h1, 0, Math.PI, () => "#9a81b1", () => "#791779"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemStrengthMin), ch(this.refOrg.stemStrengthMax), sizeX, h1, 0, Math.PI, () => "#a17191", () => "#6f2b75"));
          container.addElement(new SliderGradientBackgroundRange(this.window,ch(this.refOrg.stemPeriodMin), ch(this.refOrg.stemPeriodMax), sizeX, h1, 0, Math.PI, () => "#d19cbf", () => "#8f1919"));
               
          console.log(this.refOrg.generateGeneticCode().serialize());
     }

}