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

        let optimals = new Map()

        iterateOnOrganisms((org) => {
                optimals.set(org.proto, optimals.get(org.proto) ?? optimals[org.proto] ?? [0, 0, null]);
                optimals.get(org.proto)[0] = org.growthLightLevel;
                optimals.get(org.proto)[1] = org.waterPressureSoilTarget();
                optimals.get(org.proto)[2] = org;

                let lightInvlerp = clamp(invlerp(org.llt_min() * org.growthLightLevel, org.llt_max() * org.growthLightLevel, org.lightLevel));
                let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.waterPressureSoilTarget(), org.waterPressureOverwaterThresh() + org.waterPressureSoilTarget(), org.waterPressure));
                let xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
                let yMoistureLerp = lerp(startY, startY + this.sizeY, moistureInvlerp);
                MAIN_CONTEXT.beginPath();
                MAIN_CONTEXT.arc(xLightLerp, yMoistureLerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
                MAIN_CONTEXT.fill();
        })

        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        optimals.values().forEach((v) => {
            let org = v[2];
            let lightInvlerp = clamp(invlerp(org.llt_min() * org.growthLightLevel, org.llt_max() * org.growthLightLevel, v[0]));
            let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.waterPressureSoilTarget(), org.waterPressureOverwaterThresh() + org.waterPressureSoilTarget(), v[1]));
            let xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
            let yMoistureLerp = lerp(startY, startY + this.sizeY, moistureInvlerp);

            // draw a vertical line at x = 'xLightLerp'
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(xLightLerp, startY);
            MAIN_CONTEXT.lineTo(xLightLerp, startY + this.sizeY);
            MAIN_CONTEXT.stroke();
            
            // draw a horizontal line at y = 'yMoistureLerp'
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(startX, yMoistureLerp);
            MAIN_CONTEXT.lineTo(startX + this.sizeX, yMoistureLerp);
            MAIN_CONTEXT.stroke();

        });

    }
}