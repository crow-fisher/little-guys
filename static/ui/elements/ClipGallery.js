import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { rgbToHex, UI_TINYDOT } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDown, isLeftMouseClicked } from "../../mouse.js";
import { loadGD, loadUI, saveGD, UI_CENTER, UI_CLIPS, UI_CLIPS_DENSITY, UI_CLIPS_PAGE } from "../UIData.js";
import { WindowElement } from "../Window.js";

export class CilpGallery extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
    }
    size() {
        return [this.sizeX, this.sizeY];
    }

    render(startX, startY) {
        let clips = loadUI(UI_CLIPS);
        let gd = loadUI(UI_CLIPS_DENSITY);
        let gd2 = gd ** 2;
        let clipSizeX = this.sizeX / gd;
        let clipSizeY = this.sizeY / gd;
        for (let i = 0; i < gd2; i++) {
            let clip = clips[loadUI(UI_CLIPS_PAGE) * 4 + i];
            if (clip != null)
                this.renderClip(startX + clipSizeX * (i % gd), startY + clipSizeY * Math.floor(i / gd), clipSizeX, clipSizeY, clip);
            
        }
        return [this.sizeX, this.sizeY];
    }

    renderClip(startX, startY, sizeX, sizeY, clip) {
        clip = Array.from(clip.filter((v) => v));

        let clipPixels = clip.length;
        let canvasArea = sizeX * sizeY;
        let frac = 1; //canvasArea / (clipPixels ** 1.1);

        let midX = 0, midY = 0;
        clip.forEach((sq) => {
            let sqpx = sq.posX;
            let sqpy = sq.posY;
            midX += sqpx / clip.length;
            midY += sqpy / clip.length;
        });

        clip.forEach((sq) => {
            let cb = sq.getColorBase();
            let posX = startX + ((sq.posX - midX) / frac);
            let posY = startY + ((sq.posY - midY) / frac);
            MAIN_CONTEXT.fillStyle = rgbToHex(cb.r, cb.g, cb.b);
            MAIN_CONTEXT.fillRect(posX, posY, 10, 10);

        })
        

        

    }
}