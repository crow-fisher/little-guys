import { getBaseSize, getBaseUISize, getCanvasSquaresX, recacheCanvasPositions } from "../../canvas.js";
import { indexCanvasSize } from "../../index.js";
import { Container } from "../Container.js";
import { Button } from "../elements/Button.js";
import { WorldPanButton } from "../elements/WorldPanButton.js";
import { WorldPanSlider } from "../elements/WorldPanSlider.js";
import { LockedComponent } from "../LockedComponent.js";
import { loadGD, saveGD, UI_CANVAS_SQUARES_ZOOM, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_GAME_MAX_CANVAS_SQUARES_X } from "../UIData.js";
import { WorldPanContainer } from "../WorldPanContainer.js";
import { WorldPanLockedComponent } from "../WorldPanLockedComponent.js";
export class WorldPanComponent extends WorldPanLockedComponent {
    constructor(posXFunc, posYFunc, padding, dir, key) {
        super(posXFunc, posYFunc, padding, dir, key, true, false);
        let sizeX = getBaseSize() * 55;
        let half = sizeX / 2;
        let third = sizeX / 3;
        let container = new Container(this.window, padding, 1);
        this.window.container = container;

        let h1 = getBaseUISize() * 3.5;
        let h2 = getBaseUISize() * 3;
        let h3 = getBaseUISize() * 2;
        let br = getBaseUISize() * .5;

        let row = new WorldPanContainer(this.window, getBaseUISize() * 1, 0);
        container.addElement(row);

        row.addElement(new WorldPanButton(this.window, getBaseUISize() * 3, getBaseUISize() * 3, 0, 
            () => alert("FCK"), "", "rgba(50, 50, 50,"));

        row.addElement(new WorldPanSlider(this.window, UI_CANVAS_VIEWPORT_CENTER_X, sizeX, getBaseUISize() * 3, 0, loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) * getBaseSize(), "rgba(50, 50, 50, ", "rgba(50, 50, 50, "));

        row.addElement(new WorldPanButton(this.window, getBaseUISize() * 3, getBaseUISize() * 3, 0, 
            () => {
                let startCamX = loadGD(UI_CANVAS_VIEWPORT_CENTER_X);
                let startCamY = loadGD(UI_CANVAS_VIEWPORT_CENTER_Y);
                let startZoom = loadGD(UI_CANVAS_SQUARES_ZOOM);

                saveGD(UI_GAME_MAX_CANVAS_SQUARES_X, loadGD(UI_GAME_MAX_CANVAS_SQUARES_X) + getCanvasSquaresX());
                indexCanvasSize();

                saveGD(UI_CANVAS_VIEWPORT_CENTER_X, startCamX + (getBaseSize() * getCanvasSquaresX() * 0.5));
                saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, startCamY);
                saveGD(UI_CANVAS_SQUARES_ZOOM, startZoom);

                recacheCanvasPositions();

            }, "", "rgba(50, 50, 50,"));
    }
}
