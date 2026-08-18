import { getBaseUISize } from "../../../canvas.js";
import { COLOR_BLACK, COLOR_GREEN } from "../../../colors.js";
import { clamp, invlerp, lerp } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { iterateOnOrganisms } from "../../../organisms/orgOperations.js";
import { WindowElement } from "../../Window.js";

export class Graph2DLined extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
    }

    update() {

    }

    render(startX, startY) {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        MAIN_CONTEXT.fillStyle = COLOR_GREEN;

        iterateOnOrganisms((org) => {
                let lightInvlerp = clamp(invlerp(org.llt_min() * org.growthLightLevel, org.llt_max() * org.growthLightLevel, org.lightLevel));
                let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.waterPressureSoilTarget(), org.waterPressureOverwaterThresh() + org.waterPressureSoilTarget(), org.waterPressure));

                let xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
                let yMoistureInvlerp = lerp(startY, startY + this.sizeY, moistureInvlerp);
        MAIN_CONTEXT.beginPath();
                
                MAIN_CONTEXT.arc(xLightLerp, yMoistureInvlerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
                MAIN_CONTEXT.fill();

        })

    }
}