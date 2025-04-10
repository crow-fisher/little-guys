import { getBaseUISize } from "../../canvas.js";
import { getActiveClimate } from "../../climate/climateManager.js";
import { SunCalc } from "../../climate/suncalc/suncalc.js";
import { explicitSeek, getCurDay, getSkyBackgroundColorForDay, millis_per_day, seek } from "../../climate/time.js";
import { COLOR_BLACK, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { rgbToHex, rgbToRgba } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { isLeftMouseClicked } from "../../mouse.js";
import { loadGD, saveGD, UI_PALETTE_COMPOSITION, UI_PALETTE_ROCKIDX, UI_PALETTE_ROCKMODE, UI_PALETTE_SOILIDX } from "../UIData.js";
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

    }

    render(startX, startY) {
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
    
        const a = 0.8; // horizontal "radius"
        const b = 0.9; // vertical max height

    
        for (let i = 0; i < this.sizeX; i++) {
            let renderLineCurDay = getCurDay() - this.startTime + (i / this.sizeX);
            let xd = Math.abs(0.5 - (i / this.sizeX)); 
            let height = Math.sqrt(1 - (xd / a) ** 2) * b;
            let offset = (1 - height);
    
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(i + startX, startY + this.sizeY * offset);
            MAIN_CONTEXT.lineTo(i + startX, startY + this.sizeY - this.sizeY * offset);
    
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
            let xd = Math.abs(0.5 - (i / this.sizeX)); 
            let height = Math.sqrt(1 - (xd / a) ** 2) * b;
            let offset = (1 - height);
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.moveTo(i + startX, startY + this.sizeY * offset);
            MAIN_CONTEXT.lineTo(i + startX, startY + this.sizeY - this.sizeY * offset);
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
