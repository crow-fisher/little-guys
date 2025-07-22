import { addWaterSaturationPascals, getHumidity, getWaterSaturation } from "../simulation/temperatureHumidity.js";
import { getCurDay, timeScaleFactor } from "../time.js";
import { addWindPressureDryAir, addWindPressureDryAirWindSquare, getBaseAirPressureAtYPosition, getPressure, isPointInWindBounds, manipulateWindPressureMaintainHumidityWindSquare } from "../simulation/wind.js";
import { MAIN_CONTEXT } from "../../index.js";
import { getBaseSize, zoomCanvasFillRect } from "../../canvas.js";
import { hexToRgbArr, hsv2rgb, rgb2hsv, rgbToHex, rgbToRgba } from "../../common.js";

const cloud_id_c1 = "#B873B0";
const cloud_id_c2 = "#3B747B";

const cloud_id_c1_rgb = hexToRgbArr("#B873B0");
const cloud_id_c2_rgb = hexToRgbArr("#3B747B");

const cloud_id_c1_hsv = rgb2hsv(...cloud_id_c1_rgb);
const cloud_id_c2_hsv = rgb2hsv(...cloud_id_c2_rgb);

function getCloudIdColor(strength) {
    let v1 = Math.random();
    let v2 = Math.random();
    let v3 = Math.random();
    return rgbToRgba(...hsv2rgb(
        cloud_id_c1_hsv[0] * v1 + cloud_id_c2_hsv[0] * (1 - v1),
        cloud_id_c1_hsv[1] * v2 + cloud_id_c2_hsv[1] * (1 - v2),
        cloud_id_c1_hsv[2] * v3 + cloud_id_c2_hsv[2] * (1 - v3),
    ), .02);
}

export class Cloud {
    constructor(centerX, centerY, sizeX, sizeY, startDay, duration, targetHumidity, strength, airPressure = 1) {
        this.centerX = Math.floor(centerX);
        this.centerY = Math.floor(centerY);
        this.sizeX = Math.floor(sizeX);
        this.sizeY = Math.floor(sizeY);
        this.startDay = startDay;
        this.duration = duration;
        this.targetHumidity = targetHumidity;
        this.strength = strength;
        this.airPressure = airPressure;

        this.startElipse = [];
        this.centerElipse = [];
        this.endElipse = [];

        this.idColor = getCloudIdColor((targetHumidity - .97) * 5); 
        this.initCloud();
    }

    initCloud() {
        this.centerElipse = [this.centerX, this.centerY, this.sizeX, this.sizeY];
        this.startElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
        this.endElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
    }

    renderDebug() {
        if (getCurDay() < this.startDay) {
            return;
        }

        MAIN_CONTEXT.fillStyle = this.idColor;
        let startElipse, endElipse;
        let durationFrac = (getCurDay() - this.startDay) / this.duration;

        let curDuration;
        if (durationFrac > 0.5) {
            startElipse = this.centerElipse;
            endElipse = this.endElipse;
            curDuration = durationFrac - 0.5;
        } else {
            startElipse = this.startElipse;
            endElipse = this.centerElipse;
            curDuration = durationFrac;
        }
        curDuration *= 2;

        let curElipse = [
            startElipse[0] * (1 - curDuration) + endElipse[0] * (curDuration),
            startElipse[1] * (1 - curDuration) + endElipse[1] * (curDuration),
            startElipse[2] * (1 - curDuration) + endElipse[2] * (curDuration),
            startElipse[3] * (1 - curDuration) + endElipse[3] * (curDuration)
        ];
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                let curLoc = (i / curElipse[2]) ** 2 + (j / curElipse[3]) ** 2;
                if (curLoc > 1) {
                    continue;
                }
                for (let xside = -1; xside <= 1; xside += 2) {
                    for (let yside = -1; yside <= 1; yside += 2) {
                        let wx = Math.round(this.centerX + (xside * i));
                        let wy = Math.round(this.centerY + (yside * j));
                        if (!isPointInWindBounds(wx, wy) || getPressure(wx, wy) < 0) {
                            continue;
                        }
                        if (i == 0 && xside == 1) {
                            continue;
                        }
                        if (j == 0 && yside == 1) {
                            continue;
                        }
                        zoomCanvasFillRect(wx * 4 * getBaseSize(), wy * 4 * getBaseSize(), 4 * getBaseSize(), 4 * getBaseSize());
                    }
                }
            }
        }
    }

    tick() {
        if (getCurDay() < this.startDay) {
            return;
        }
        let startElipse, endElipse;
        let durationFrac = (getCurDay() - this.startDay) / this.duration;

        let curDuration;
        if (durationFrac > 0.5) {
            startElipse = this.centerElipse;
            endElipse = this.endElipse;
            curDuration = durationFrac - 0.5;
        } else {
            startElipse = this.startElipse;
            endElipse = this.centerElipse;
            curDuration = durationFrac;
        }
        curDuration *= 2;

        let curElipse = [
            startElipse[0] * (1 - curDuration) + endElipse[0] * (curDuration),
            startElipse[1] * (1 - curDuration) + endElipse[1] * (curDuration),
            startElipse[2] * (1 - curDuration) + endElipse[2] * (curDuration),
            startElipse[3] * (1 - curDuration) + endElipse[3] * (curDuration)
        ];

        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                let curLoc = (i / curElipse[2]) ** 2 + (j / curElipse[3]) ** 2;
                if (curLoc > 1) {
                    continue;
                }
                for (let xside = -1; xside <= 1; xside += 2) {
                    for (let yside = -1; yside <= 1; yside += 2) {
                        let wx = Math.round(this.centerX + (xside * i));
                        let wy = Math.round(this.centerY + (yside * j));
                        if (!isPointInWindBounds(wx, wy) || getPressure(wx, wy) < 0) {
                            continue;
                        }
                        if (i == 0 && xside == 1) {
                            continue;
                        }
                        if (j == 0 && yside == 1) {
                            continue;
                        }

                        if (this.targetHumidity != -1) {
                            let cur = getHumidity(wx, wy);
                            let waterPascals = (this.targetHumidity - cur) * (getWaterSaturation(wx, wy) / cur) * this.strength;
                            waterPascals /= 100;
                            addWaterSaturationPascals(wx, wy, waterPascals);
                        } else {
                            addWindPressureDryAir(wx * 4, wy * 4, this.airPressure);
                        }

                    }
                }
            }
        }
    }
}
