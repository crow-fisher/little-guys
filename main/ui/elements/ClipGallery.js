import { COLOR_BLACK, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { rgbToHex, UI_TINYDOT } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getLastMouseDownStart, isLeftMouseClicked } from "../../mouse.js";
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
                this.renderClip(startX + clipSizeX * (.5 + i % gd), startY + clipSizeY * (0.5 + Math.floor(i / gd)), clipSizeX, clipSizeY, clip);
            
        }
        return [this.sizeX, this.sizeY];
    }

    renderClip(startX, startY, sizeX, sizeY, clip) {
        clip = Array.from(clip.filter((v) => v));

        let clipPixels = clip.length;
        let canvasArea = sizeX * sizeY;
        let frac = 1;   

        // need to just set these up in a struct that has all the metadata that's needed to render and scale them properly

        let midX = 0, midY = 0;
        clip.forEach((sq) => {
            let sqpx = sq.posX;
            let sqpy = sq.posY;
            midX += sqpx / clip.length;
            midY += sqpy / clip.length;
        });

        for (let i = 0; i < clip.length; i += (5 * frac)) {
            let sq = clip[Math.floor(i)];
            let cb = sq.getColorBase();
            let posX = startX + ((sq.posX - midX) * frac);
            let posY = startY + ((sq.posY - midY) * frac);
            MAIN_CONTEXT.fillStyle = rgbToHex(cb.r, cb.g, cb.b);
            MAIN_CONTEXT.fillRect(posX, posY, 10, 10);
        }

    }
}