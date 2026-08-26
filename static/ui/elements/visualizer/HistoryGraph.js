import { getBaseUISize } from "../../../canvas.js";
import { getCurDay } from "../../../climate/time.js";
import { COLOR_BLACK, COLOR_GREEN, RGB_COLOR_BLUE, RGB_COLOR_VERY_FUCKING_RED } from "../../../colors.js";
import { clamp, hsvToHex, invlerp, lerp, rgbToRgba } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { iterateOnOrganisms } from "../../../organisms/orgOperations.js";
import { STAGE_DEAD } from "../../../organisms/Stages.js";
import { loadGD, UI_EVOLUTION_ACTIVE_PARAM, UI_ORGANISM_LINEAGE_MAP } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class HistoryGraph extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
        this.roots = new Set();
        this.evolutionMinColor = RGB_COLOR_BLUE;
        this.evolutionMaxColor = RGB_COLOR_VERY_FUCKING_RED;
    }

    processColor(color1, color2, value, valueMax, opacity) {
        let frac = value / valueMax;
        let outColor = {
            r: color1.r * frac + color2.r * (1 - frac),
            g: color1.g * frac + color2.g * (1 - frac),
            b: color1.b * frac + color2.b * (1 - frac)
        }
        return rgbToRgba(Math.floor(outColor.r), Math.floor(outColor.g), Math.floor(outColor.b), opacity);
    }

    getEvolutionColor(v, opacity) {
        return this.processColor(this.evolutionMinColor, this.evolutionMaxColor, v, 1, opacity);
    }
    
    renderLineage(startX, startY, id, depth) {
        if (depth > this.num) {
            return;
        }
        if (this.seen.has(id)) {
            return;
        }
        this.seen.add(id);
        MAIN_CONTEXT.strokeWidth = .1;
        let pid = this.m[id]?.pid;
        if (this.m[pid]) {
            let o = this.m[id];
            let p = this.m[pid];
            
            this.minDepth = getCurDay() - .025;

            let sx = 1 - invlerp(this.minDepth, getCurDay(), o.time);
            let sy = 1 - invlerp(this.minDepth, getCurDay(), p.time);

            if (clamp(sx) != sx || clamp(sy) != sy) {
                return;
            }

            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(startX + this.sizeX * sx, startY + this.sizeY * o.ep[this.param]);
            MAIN_CONTEXT.lineTo(startX + this.sizeX * sy, startY + this.sizeY * p.ep[this.param]);
            MAIN_CONTEXT.stroke();
            this.m[id].children.forEach((cid) => this.renderLineage(startX, startY, cid, depth - 1))
        }
        this.renderLineage(startX, startY, pid, depth + 1)
    }

    renderFromRoot(startX, startY) {
        this.rootsIter = Array.from(this.roots);
        this.rootsIter = Array.from(this.rootsIter.map((root) => this.m[root]).filter((o) => o != null));
        this.rootsIter.sort((a, b) => b.time - a.time);

        this.rootsIter.forEach((root) => {
                let sx = invlerp(this.minDepth, getCurDay(), root.time);
                MAIN_CONTEXT.strokeStyle = this.getEvolutionColor(root.ep[this.param], 1);
                this.renderLineage(startX, startY, root.id, 1)
        })
    }

    render(startX, startY) {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let optimals = new Map() 

        this.num = 10;
        this.m = loadGD(UI_ORGANISM_LINEAGE_MAP);
        this.param = loadGD(UI_EVOLUTION_ACTIVE_PARAM);
        this.seen = new Set();

        let generations = [];
            iterateOnOrganisms((org) => {
                if (org.__proto__.__proto__.constructor.name == "BaseSeedOrganism") {
                    return;
                }
                this.roots.add(org.id);

            
                
                // MAIN_CONTEXT.strokeStyle = org.getEvolutionColor(0.85);
                // MAIN_CONTEXT.beginPath();

                //     let p = m[org.parentId];
                //     if (p) {

                //     }
                // }

                // for (let i = 2; i < Math.min(this.num, org.parentId.length); i++) {
                //     let prev = i - 1;
                //     MAIN_CONTEXT.beginPath();
                //     MAIN_CONTEXT.moveTo(startX + this.sizeX * (1 - prev/this.num), startY + this.sizeY * org.parentId[org.parentId.length - prev][this.param]);
                //     MAIN_CONTEXT.lineTo(startX + this.sizeX * (1 - i/this.num), startY + this.sizeY * org.parentId[org.parentId.length - i][this.param]);
                //     MAIN_CONTEXT.stroke();
                // }
                // MAIN_CONTEXT.fillStyle = hsvToHex(org.orgInfoHue, clamp(org.parentId.length / 5), 1);
                // MAIN_CONTEXT.arc(xLightLerp, yMoistureLerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
        });

        this.renderFromRoot(startX, startY)
    }
}