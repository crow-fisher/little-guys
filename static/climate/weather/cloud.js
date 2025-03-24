import { addWaterSaturationPascals, getHumidity, getWaterSaturation } from "../temperatureHumidity.js";
import { getCurDay, timeScaleFactor } from "../time.js";
import { addWindPressureDryAirWindSquare, getBaseAirPressureAtYPosition, getPressure, isPointInWindBounds } from "../wind.js";


export class Cloud {
    constructor(centerX, centerY, sizeX, sizeY, startDay, duration, targetHumidity, strength, airPressure=1) {
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
        this.initCloud();
    }

    initCloud() {
        this.centerElipse = [this.centerX, this.centerY, this.sizeX, this.sizeY];
        this.startElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
        this.endElipse = [this.centerX, this.centerY, this.sizeX / (2 + Math.random()), this.sizeY / (2 + Math.random())];
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
                        let airPascals = (getBaseAirPressureAtYPosition(wy) * this.airPressure - getPressure(wx, wy));
                        airPascals /= 100;
                        airPascals /= timeScaleFactor();
                        addWindPressureDryAirWindSquare(wx, wy, airPascals);

                        if (this.targetHumidity != -1) {
                            let cur = getHumidity(wx, wy);
                            let waterPascals = (this.targetHumidity - cur) * (getWaterSaturation(wx, wy) / cur) * this.strength;
                            waterPascals /= timeScaleFactor();
                            addWaterSaturationPascals(wx, wy, waterPascals);
                        }
         
                    }
                }
            }
        }

    }
}
