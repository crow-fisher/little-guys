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

        let xPadL = -1;
        let xPadR =  1;
        let yPadB = -2;
        let yPadT =  2;

        // xMin = 0;
        // xMax = 0;
        // yMin = -1;
        // yMax = 1;
        let xMin = 10 ** 8, xMax = 0, yMin = 10 ** 8, yMax = 0;

        let optimals = new Map()
            iterateOnOrganisms((org) => {
                if (org.__proto__.__proto__.constructor.name == "BaseSeedOrganism") {
                    return;
                }

                if (org.stage == STAGE_DEAD) {
                    return;
                }

                optimals.set(org.proto, optimals.get(org.proto) ?? optimals[org.proto] ?? [0, 0, null]);
                optimals.get(org.proto)[0] = org.growthLightLevel;
                optimals.get(org.proto)[1] = org.waterPressureSoilTarget();
                optimals.get(org.proto)[2] = org;

                let lightInvlerp = clamp(invlerp(org.llt_min() * org.growthLightLevel + xPadL, org.llt_max() * org.growthLightLevel + xPadR, org.lightLevel));
                let moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.waterPressureSoilTarget() + yPadB, org.waterPressureOverwaterThresh() + org.waterPressureSoilTarget() + yPadT, org.waterPressure));
                let xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
                let yMoistureLerp = lerp(startY, startY + this.sizeY, moistureInvlerp);

                // MAIN_CONTEXT.fillStyle = hsvToHex(org.orgInfoHue, clamp(org.parentId.length / 5), 1);
                MAIN_CONTEXT.fillStyle = org.getEvolutionColor(0.85);
                MAIN_CONTEXT.beginPath();
                MAIN_CONTEXT.arc(xLightLerp, yMoistureLerp, getBaseUISize() * .2, 0, 2 * Math.PI, false);
                MAIN_CONTEXT.fill();

                lightInvlerp = clamp(invlerp(org.llt_min() * org.getGrowthLightLevel() + xPadL, org.llt_max() * org.getGrowthLightLevel() + xPadR, org.getGrowthLightLevel()));
                moistureInvlerp = clamp(invlerp(org.waterPressureWiltThresh() + org.getWaterPressureSoilTarget() + yPadB, org.waterPressureOverwaterThresh() + org.getWaterPressureSoilTarget() + yPadT, org.getWaterPressureSoilTarget()));
                xLightLerp = lerp(startX, startX + this.sizeX, lightInvlerp);
                yMoistureLerp = lerp(startY, startY + this.sizeY, moistureInvlerp);
                
                xMin = Math.min(xMin, xLightLerp);
                xMax = Math.max(xMax, xLightLerp);

                yMin = Math.min(yMin, yMoistureLerp);
                yMax = Math.max(yMax, yMoistureLerp);

        });

        MAIN_CONTEXT.fillStyle = COLOR_BLACK;

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.moveTo(xMin, yMin);
        MAIN_CONTEXT.lineTo(xMax, yMax);
        MAIN_CONTEXT.stroke();
        

        // let xMin = 10 ** 8, xMax = 0, yMin = 10 ** 8; yMax = 0;

        // optimals.values().forEach((v) => {
        //     let org = v[2];


        //     xMin = Math.min(xMin, xLightLerp);
        //     xMax = Math.max(xMax, xLightLerp);

        //     yMin = Math.min(yMin, yMoistureLerp);
        //     yMax = Math.max(yMax, yMoistureLerp);
        // });

        // // draw a line between our optimal points


    }
}