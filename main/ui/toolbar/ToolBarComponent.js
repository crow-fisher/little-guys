import { isPointInsideQuad } from "../../util/quad.js";
import { Component } from "../Component.js";
import { ToolBarElement } from "./ToolBarElement.js";
import { DIRT, COLOR, STONE, PLANE, BLOCK, REPLACE, ERASE, DRAG, CLICK } from "./toolbarEnum.js";

// not really a 'component'....a component has a window and is freely positionable. 
// this is more like the topbar, where it lives on its own little island? 

export class ToolBarComponent {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.name = "ToolBarComponent";
        this.canvasManager = uiManager.mainManager.canvasManager;
        this.mouseManager = uiManager.mainManager.inputManager.mouseManager;

        this.yOffset = 0.9;
        this.yHeight = 0.1;

        this.toolBarElements = [
            new ToolBarElement(this.uiManager, "drag", () => this.isClickModeActive(CLICK), () => this.setClickModeActive(CLICK)),
            new ToolBarElement(this.uiManager, "click", () => this.isClickModeActive(DRAG), () => this.setClickModeActive(DRAG)),

            new ToolBarElement(this.uiManager, "plane", () => this.isBrushModeActive(PLANE), () => this.setBrushModeActive(PLANE)),
            new ToolBarElement(this.uiManager, "block", () => this.isBrushModeActive(BLOCK), () => this.setBrushModeActive(BLOCK)),
            new ToolBarElement(this.uiManager, "replace", () => this.isBrushModeActive(REPLACE), () => this.setBrushModeActive(REPLACE)),
            new ToolBarElement(this.uiManager, "erase", () => this.isBrushModeActive(ERASE), () => this.setBrushModeActive(ERASE)),
            
            new ToolBarElement(this.uiManager, "¤", () => this.canvasManager.pointerLock, () => this.canvasManager.lockPointer()),
            new ToolBarElement(this.uiManager, "d", () => this.isToolActive(DIRT), () => this.setToolActive(DIRT)),
            new ToolBarElement(this.uiManager, "s", () => this.isToolActive(STONE), () => this.setToolActive(STONE)),
            new ToolBarElement(this.uiManager, "p", () => this.isToolActive(COLOR), () => this.setToolActive(COLOR))
        ]
    }

    isClickModeActive(id) {
        return this.uiManager.toolbarConfig.clickMode == id; 
    }

    setClickModeActive(id) {
        this.uiManager.toolbarConfig.clickMode = id;
    }

    isToolActive(id) {
        return this.uiManager.toolbarConfig.activeTool == id;
    }
    setToolActive(id) {
        this.uiManager.toolbarConfig.activeTool = id;
    }

    isBrushModeActive(id) {
        return this.uiManager.toolbarConfig.activeBrushMode == id;
    }
    setBrushModeActive(id) {
        this.uiManager.toolbarConfig.activeBrushMode = id;
    }

    update() {
        // define size of each element
        this._dX = this.uiManager.getBaseUISize() * 6; 
        this._dY = this.uiManager.getBaseUISize() * 6;

        // define starting x position
        this._wX = this._dX * this.toolBarElements.length;
        this._pX = Math.floor(this.uiManager.getWidth() / 2 - (this._wX / 2));

        // define starting y position
        this._pY = Math.floor(this.uiManager.getHeight() * this.yOffset);

        if (this.mouseManager.isFrameButtonPressed(0)) {
            this.toolBarElements
                .filter((el) => isPointInsideQuad(this.mouseManager.offset, ...el.bounds))
                .forEach((el) => { 
                    el.relMouse[0] = this.mouseManager.offset.x - el.bounds[0][0];
                    el.relMouse[1] = this.mouseManager.offset.y - el.bounds[1][1];
                    el.interact();
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
