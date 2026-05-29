import { hsvToHex } from "../../color/color.js";
import { hexToRgb, invlerp, rgbToHexObj } from "../../common.js";
import { SunCalc } from "../../lib/suncalc/suncalc.js";
import { MILLIS_PER_DAY } from "../../util/const.js";

export class TimeManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.curDay = 100;
        this.curTimeScale = 1;
        this.daylightStrength = 0;
        this.lastTimeTick = Date.now();
        this.colorRGB = {r: 255, g: 255, b: 255}
        this.colorHEX = "#FFFFFF";

        this.lat = 41.881832;
        this.lng = -87.623177;


        this.sky_nightRGB = hexToRgb("#121622");
        this.sky_duskRGB = hexToRgb("#272525");
        this.sky_colorEveningMorningRGB = hexToRgb("#A49F67");
        this.sky_colorNearNoonRGB = hexToRgb("#7E9FB1");
        this.sky_colorNoonRGB = hexToRgb("#84b2e2");

        this.timeColors = {
            dawn: this.sky_duskRGB,
            sunrise: this.sky_colorEveningMorningRGB,
            goldenHourEnd: this.sky_colorNearNoonRGB,
            solarNoon: this.sky_colorNoonRGB,
            goldenHour: this.sky_colorNearNoonRGB,
            sunsetStart: this.sky_colorEveningMorningRGB,
            dusk: this.sky_duskRGB,
            night: this.sky_nightRGB
        }
    }

    getTimeScale() {
        return (3.8 ** (this.curTimeScale - 1));
    }

    getDaylightStrength() {
        this.suncalcInfo = SunCalc.getPosition(new Date(curDay * millis_per_day), this.lat, this.lng);
        // console.log(sunData.altitude, Math.sin(sunData.altitude));
        if (this.suncalcInfo.altitude < 0) {
            this.daylightStrength = 0;
        }
        this.daylightStrength = Math.sin(this.suncalcInfo.altitude);
    }
    

    update() { 
        this.timeTick(); 
        this.colorTick();
    }

    render() {
        this.worldManager.getContext().fillStyle = this.colorHEX;
        this.worldManager.getContext().fillRect(
            0,
            0,
            this.worldManager.getCanvasWidth(),
            this.worldManager.getCanvasHeight()
        );
    }

    seekCurDay(curDay) { }

    timeTick() {
        if (this.curTimeScale == 0) {
            this.dt = 0;
        } else {
            this.dt = (Date.now() - this.lastTimeTick) / (MILLIS_PER_DAY / this.getTimeScale());
            this.lastTimeTick = Date.now();
        }
        this.curDay += this.dt;
    };

    colorTick(curDay) {
        // pull out of the shit below and do that there
        this.curMillis = this.curDay * MILLIS_PER_DAY;
        this.curDate = new Date(this.curMillis);
        this.nextDate = new Date(this.curMillis + MILLIS_PER_DAY);
        this.prevDate = new Date(this.curMillis - MILLIS_PER_DAY);

        this.prevTimes = SunCalc.getTimes(this.prevDate, this.lat, this.lng);
        this.curTimes = SunCalc.getTimes(this.curDate, this.lat, this.lng);
        this.nextTimes = SunCalc.getTimes(this.nextDate, this.lat, this.lng);
        this.timesArr = new Array();

        [this.prevTimes, this.curTimes, this.nextTimes].forEach((times) => Object.keys(this.timeColors).forEach((key) => {
            this.timesArr.push([times[key], this.timeColors[key], key]);
        }));

        this.timesArr.sort((a, b) => a[0].getTime() - b[0].getTime());

        // let minColor, maxColor, min, max, starBrightness;
        this.idx = this.timesArr.findIndex((arr) => this.curDate < arr[0]);
        this.minArr = this.timesArr[this.idx - 1];
        this.maxArr = this.timesArr[this.idx];
        this.min = this.minArr[0];
        this.max = this.maxArr[0];
        this.minColor = this.minArr[1];
        this.maxColor = this.maxArr[1];

        this._ps = invlerp(this.min.getTime(), this.max.getTime(), this.curDate.getTime());
        this.colorRGB.r = this.minColor.r * (1 - this._ps) + this.maxColor.r * this._ps; 
        this.colorRGB.g = this.minColor.g * (1 - this._ps) + this.maxColor.g * this._ps; 
        this.colorRGB.b = this.minColor.b * (1 - this._ps) + this.maxColor.b * this._ps; 

        // this impl was cool, def use it once you have clouds

        // let frameCloudColor = getFrameRelCloud();
        // let frameCloudMult = Math.min(1, (frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 5);

        // let processedColorHsv = rgb2hsv(processedColor.r, processedColor.g, processedColor.b);
        // processedColorHsv[1] *= (1 - frameCloudMult);

        // let processedColorRGBArr = hsv2rgb(processedColorHsv[0], processedColorHsv[1], processedColorHsv[2]);

        // processedColor.r = processedColorRGBArr[0] - (frameCloudColor.r)
        // processedColor.g = processedColorRGBArr[1] - (frameCloudColor.g)
        // processedColor.b = processedColorRGBArr[2] - (frameCloudColor.b)
        this.colorHEX = rgbToHexObj(this.colorRGB);
    }
}