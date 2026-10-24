import { TopBarElementBase } from "./TopBarElementBase.js";

export class TopBarText extends TopBarElementBase{
    constructor(uiManager, fontSize, textAlign, labelFunc) {
        super(uiManager, fontSize, textAlign);
        this.labelFunc = labelFunc;
        this.lastClick = 0;
    }

    measure() {
        if (this.labelFunc() == "") {
            return [0, 0];
        }
        this.prepareStyle();
        let measured = this.uiManager.getContext().measureText(this.labelFunc());
        return [measured.width, measured.fontBoundingBoxAscent];
    }

    render(startX, startY) {
        if (this.labelFunc() == "") {
            return;
        }
        
        this.prepareStyle();

        let checked = false;
        if (checked)
            this.uiManager.getContext().fillStyle = "#FFFFFF";
        else
            this.uiManager.getContext().fillStyle = "#999999";
        this.uiManager.getContext().fillText(this.labelFunc(), startX, startY)
    }

    interact(posX, posY) {
        // if (!isLeftMouseClicked()) {
        //     return;
        // } 
        // if (this.lastClick != getLastMouseDownStart()) {
        //     this.lastClick = getLastMouseDownStart();
        // }
    }
}