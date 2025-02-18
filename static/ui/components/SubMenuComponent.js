import { Component } from "../Component.js";
import { Container } from "../Container.js";
import { Toggle } from "../elements/Toggle.js";
import { UI_SM_BB, UI_SM_LIGHTING, UI_SM_SPECIAL, UI_SM_VIEWMODE, UI_SOIL_COMPOSITION } from "../UIData.js";


let padding = 10;
export class SubMenuComponent extends Component {
    constructor(posX, posY, padding, dir, key) {
        super(posX, posY, padding, dir, key);
        let subMenuContainer = new Container(this.window, UI_SOIL_COMPOSITION, 100, 100, padding, 1);
        this.window.addElement(subMenuContainer);

        subMenuContainer.addElement(new Toggle(this.window, 75, 25, UI_SM_BB, "ground"));
        subMenuContainer.addElement(new Toggle(this.window, 75, 25, UI_SM_SPECIAL, "special"));
        subMenuContainer.addElement(new Toggle(this.window, 75, 25, UI_SM_LIGHTING, "lighting"));
        subMenuContainer.addElement(new Toggle(this.window, 75, 25, UI_SM_VIEWMODE, "viewmode"));
        
    }

}