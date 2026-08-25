import { getBaseUISize } from "../../../canvas.js";
import { COLOR_BLACK, COLOR_GREEN } from "../../../colors.js";
import { clamp, hsvToHex, invlerp, lerp } from "../../../common.js";
import { MAIN_CONTEXT } from "../../../index.js";
import { iterateOnOrganisms } from "../../../organisms/orgOperations.js";
import { STAGE_DEAD } from "../../../organisms/Stages.js";
import { WindowElement } from "../../Window.js";

export class LiteralGraph extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);
    }

    update() {

    }

    render(startX, startY) {
        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);

        let xMin = -1;
        let xMax =  1;
        let yMin = -2;
        let yMax =  2;

        // xMin = 0;
        // xMax = 0;
        // yMin = -1;
        // yMax = 1;

        let optimals = new Map()
            iterateOnOrganisms((org) => {
                if (org.__proto__.__proto__.constructor.name == "BaseSeedOrganism") {
                    return;
                }

                if (org.stage == STAGE_DEAD) {
                    return;
                }

                optimals.set(org.proto, optimals.get(org.proto) ?? optimals[org.proto] ?? [0, 0, null]);
                optimals.get(org.proto)[0] = org.getGrowthLightLevel();
                optimals.get(org.proto)[1] = org.getWaterPressureSoilTarget();
                optimals.get(org.proto)[2] = org;

                let lightInvlerp = clamp(invlerp(org.llt_min() * org.getGrowthLightLevel() + xMin, org.llt_max() * org.getGrowthLightLevel() + xMax, org.lightLevel));
                let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.getWaterPressureSoilTarget() + yMin, org.waterPressureOverwaterThresh() + org.getWaterPressureSoilTarget() + yMax, org.waterPressure));
                let xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
                let yMoistureLerp = lerp(startY, startY + this.sizeY, moistureInvlerp);

                // MAIN_CONTEXT.fillStyle = hsvToHex(org.orgInfoHue, clamp(org.parentId.length / 5), 1);
                MAIN_CONTEXT.fillStyle = org.getEvolutionColor(0.85);
                MAIN_CONTEXT.beginPath();
                MAIN_CONTEXT.arc(xLightLerp, yMoistureLerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
                MAIN_CONTEXT.fill();
        });

        MAIN_CONTEXT.fillStyle = COLOR_BLACK;

        optimals.values().forEach((v) => {
            let org = v[2];
            let lightInvlerp = clamp(invlerp(org.llt_min() * org.getGrowthLightLevel() + xMin, org.llt_max() * org.getGrowthLightLevel() + xMax, v[0]));
            let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.getWaterPressureSoilTarget() + yMin, org.waterPressureOverwaterThresh() + org.getWaterPressureSoilTarget() + yMax, v[1]));
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