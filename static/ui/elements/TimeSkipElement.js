import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { SunCalc } from "../../climate/suncalc/suncalc.js";
import { explicitSeek, getCurDay, getSeekTimeTarget, getSkyBackgroundColorForDay, millis_per_day } from "../../climate/time.js";
import { COLOR_BLACK } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { WindowElement } from "../Window.js";

export const R_COLORS = "🎨";
export const R_PERCOLATION_RATE = "💦";
export const R_NUTRIENTS = "⚡";

export class TimeSkipElement extends WindowElement {
    constructor(window, sizeX, sizeY) {
        super(window, sizeX, sizeY);

        this.labels = [
            "sunrise",
            "solarNoon",
            "sunsetStart",
            "night",
            "nadir",
            "dawn"
        ]
        this.times = new Array();
        this.startTime = 0.13;
        this.sideInset = getBaseUISize() * .8;
        this.topInset = getBaseUISize() * 0.5;
        this.sizeX = getBaseUISize() * (26.404296875 + 4);
    }

    render(startX, startY) {
        MAIN_CONTEXT.fillStyle = getActiveClimate().getUIColorInactiveCustom(0.90);
        MAIN_CONTEXT.fillRect(startX, startY, this.sizeX, this.sizeY);
        this.sizeX = getBaseUISize() * (26.404296875 + 4);
        let curMillis = getCurDay() * millis_per_day;
        let curDate = new Date(curMillis);
        let nextDate = new Date(curMillis + millis_per_day);
        let prevDate = new Date(curMillis - millis_per_day);
    
        let prevTimes = SunCalc.getTimes(prevDate, getActiveClimate().lat, getActiveClimate().lng);
        let curTimes = SunCalc.getTimes(curDate, getActiveClimate().lat, getActiveClimate().lng);
        let nextTimes = SunCalc.getTimes(nextDate, getActiveClimate().lat, getActiveClimate().lng);
    
        this.times = new Array();
    
        this.labels.forEach((label) => this.times.push(prevTimes[label].getTime() / millis_per_day));
        this.labels.forEach((label) => this.times.push(curTimes[label].getTime() / millis_per_day));
        this.labels.forEach((label) => this.times.push(nextTimes[label].getTime() / millis_per_day));
    
        let toRender = new Array();

        for (let i = this.sideInset; i < this.sizeX - this.sideInset; i++) {
            let renderLineCurDay = getCurDay() - this.startTime + (i / this.sizeX);
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(i + startX, startY + this.topInset);
            MAIN_CONTEXT.lineTo(i + startX, startY + this.sizeY - this.topInset);
            let strokeStyle = getSkyBackgroundColorForDay(renderLineCurDay);
            let strokeStyleStart = strokeStyle;
    
            for (let i = 0; i < this.times.length; i++) {
                let time = this.times[i];
                if (Math.abs(renderLineCurDay - time) < (.5 / this.sizeX)) {
                    if (renderLineCurDay < getCurDay())
                        strokeStyle = getActiveClimate().getUIColorInactiveCustom(0.65);
                    else
                        strokeStyle = getActiveClimate().getUIColorInactiveCustom(0.55);
                }
            }
    
            if (Math.abs(renderLineCurDay - getCurDay()) < (1 / this.sizeX)) {
                strokeStyle = getActiveClimate().getUIColorActive();
            }

            if (Math.abs(renderLineCurDay - getSeekTimeTarget()) < (1 / this.sizeX)) {
                strokeStyle = COLOR_BLACK;
            }
    
            if (strokeStyle != strokeStyleStart) {
                toRender.push([i, strokeStyle]);
            } else {
                MAIN_CONTEXT.strokeStyle = strokeStyle;
                MAIN_CONTEXT.lineWidth = getBaseUISize() * 0.1;  
                MAIN_CONTEXT.stroke();
            }
        }
    
        toRender.forEach((arr) => {
            let i = arr[0];
            let strokeStyle = arr[1];
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(i + startX, startY + this.topInset);
            MAIN_CONTEXT.lineTo(i + startX, startY + this.sizeY - this.topInset);
            MAIN_CONTEXT.strokeStyle = strokeStyle;
            MAIN_CONTEXT.lineWidth = getBaseUISize() * 0.2;  
            MAIN_CONTEXT.stroke();
        });
        return [this.sizeX, this.sizeY];
    }

    hover(posX, posY) {
        super.hover(posX, posY);
        if (!isLeftMouseClicked()) {
            return;
        }
        let hoverCurDay = getCurDay() + (posX / this.sizeX) - this.startTime;
        if (hoverCurDay < getCurDay()) {
            return;
        }
        explicitSeek(hoverCurDay);

    }
}
