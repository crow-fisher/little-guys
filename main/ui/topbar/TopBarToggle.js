import { loadGD, saveGD, UI_BOOLEAN } from "../UIData.js";
import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarToggle extends TopBarElementBase {
    constructor(uiManager, fontSize, textAlign, ref, labelFunc, startMaxWidth=0) {
        super(uiManager, fontSize, textAlign);
        this.ref = ref;
        this.labelFunc = labelFunc;
        this.lastClick = 0;
        this.maxWidth = startMaxWidth;
    }

    measure() {
        if (this.labelFunc() == "") {
            return [0, 0];
        }
        this.prepareStyle();
        let measured =  this.uiManager.getContext().measureText(this.labelFunc());
        this.maxWidth = Math.max(measured.width, this.maxWidth);
        return [this.maxWidth, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        if (this.labelFunc() == "") {
            return;
        }
        this.prepareStyle();
        if (this.uiManager.topbarConfig[this.ref] == this.labelFunc())
             this.uiManager.getContext().fillStyle = "#FFFFFF";
        else
             this.uiManager.getContext().fillStyle = "#999999";

         this.uiManager.getContext().fillText(this.labelFunc(), startX, startY)
    }

    interact(posX, posY) {
        if (!this.uiManager.isFrameButtonPressed(0)) {
            return;
        }
        this.uiManager.topbarConfig[this.ref] = this.labelFunc();
    }
}