import { getBaseUISize } from "../../../canvas.js";
import { COLOR_BLACK, COLOR_GREEN } from "../../../colors.js";
import { clamp, hsvToHex, invlerp, lerp } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { iterateOnOrganisms } from "../../../organisms/orgOperations.js";
import { STAGE_DEAD } from "../../../organisms/Stages.js";
import { UI_ORGANISM_LINEAGE_MAP } from "../../UIData.js";
import { WindowElement } from "../../Window.js";

export class HistoryGraph extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
    }

    update() {

    }

    render(startX, startY) {
        return;
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let numLookback = 50;
        let param = 0;
        let optimals = new Map() 

        let m = loadGD(UI_ORGANISM_LINEAGE_MAP);

        let generations = [];
            iterateOnOrganisms((org) => {
                if (org.__proto__.__proto__.constructor.name == "BaseSeedOrganism") {
                    return;
                }
                
                MAIN_CONTEXT.strokeStyle = org.getEvolutionColor(0.85);
                MAIN_CONTEXT.beginPath();

                for (let i = 0; i < numLookback; i++) {
                    let p = m[org.parentId];
                    if (p) {

                    }
                }

                for (let i = 2; i < Math.min(numLookback, org.parentId.length); i++) {
                    let prev = i - 1;
                    MAIN_CONTEXT.beginPath();
                    MAIN_CONTEXT.moveTo(startX + this.sizeX * (1 - prev/numLookback), startY + this.sizeY * org.parentId[org.parentId.length - prev][param]);
                    MAIN_CONTEXT.lineTo(startX + this.sizeX * (1 - i/numLookback), startY + this.sizeY * org.parentId[org.parentId.length - i][param]);
                    MAIN_CONTEXT.stroke();
                }
                // MAIN_CONTEXT.fillStyle = hsvToHex(org.orgInfoHue, clamp(org.parentId.length / 5), 1);
                // MAIN_CONTEXT.arc(xLightLerp, yMoistureLerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
        });
    }
}