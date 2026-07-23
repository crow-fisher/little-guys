import { isPointInsideQuad } from "../../util/quad.js";
import { ToolBarElement } from "./ToolBarElement.js";

export class ToolBarComponent {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.canvasManager = uiManager.mainManager.canvasManager;
        this.mouseManager = uiManager.mainManager.inputManager.mouseManager;

        this.yOffset = 0.9;
        this.yHeight = 0.1;

        this.toolBarElements = [
            new ToolBarElement(this.uiManager, "1"),
            new ToolBarElement(this.uiManager, "2"),
            new ToolBarElement(this.uiManager, "3"),
        ]

    }

    update() {
        // define size of each element
        this._dX = this.uiManager.getBaseUISize() * 6; 
        this._dY = this.uiManager.getBaseUISize() * 6;

        // define starting x position
        this._wX = this._dX * this.toolBarElements.length;
        this._pX = this.uiManager.getWidth() / 2 - (this._wX / 2);

        // define starting y position (note - one row. don't touch this)
        this._pY = this.uiManager.getHeight() * this.yOffset;

        if (this.mouseManager.isFrameButtonPressed(0)) {
            this.toolBarElements
                .filter((el) => isPointInsideQuad(this.mouseManager.offset, ...el.bounds))
                .forEach((el) => {
                    // console.log(isPointInsideQuad(this.mouseManager.offset, ...el.bounds));
                    // console.log(this.mouseManager.offset, el.bounds)
                
                    el.active = !el.active;
                });
        }
    }

    render() {
        this.uiManager.getContext().fillStyle = "#FF0000";
        this.uiManager.getContext().fillRect(0, 0, 10, 10);
        
        this.toolBarElements.forEach((el) => {
            el.render(this._pX, this._pY, this._dX, this._dY);
            this._pX += 2 * this._dX;
        })
    }
}
