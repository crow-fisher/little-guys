import { CANVAS_SQUARES_X, CANVAS_SQUARES_Y } from "./index.js";
import { getCurDay } from "./time.js";

class Cloud {
    constructor(centerX, centerY, sizeX, sizeY, startDay, duration, rainFallAmount) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.startDay = startDay; 
        this.duration = duration;
        this.rainFallAmount = rainFallAmount;

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
        var startElipse, endElipse;
        var durationFrac = (getCurDay() - this.startDay) / this.duration;

        var curDuration;
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

        var curElipse = [
            startElipse[0] * (1 - curDuration) + endElipse[0] * (1 - curDuration),
            startElipse[1] * (1 - curDuration) + endElipse[1] * (1 - curDuration),
            startElipse[2] * (1 - curDuration) + endElipse[2] * (1 - curDuration),
            startElipse[3] * (1 - curDuration) + endElipse[3] * (1 - curDuration)
        ];

    }
}


var ALL_CLOUDS = [];

ALL_CLOUDS.push(new Cloud(CANVAS_SQUARES_X / 8, CANVAS_SQUARES_Y / 8, 10, 5, getCurDay(), 1, 100));

export function weather() {
    ALL_CLOUDS.forEach((cloud) => cloud.tick());
}