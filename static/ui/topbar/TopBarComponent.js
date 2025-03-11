import { getBaseUISize, getCanvasWidth } from "../../canvas.js";
import { COLOR_BLACK } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import { TopBarTime } from "./TopBarTime.js";
import {
    loadUI,
    UI_SPEED_1,
    UI_SPEED_2,
    UI_SPEED_3,
    UI_SPEED_4,
    UI_SPEED_5,
    UI_SPEED_6,
    UI_SPEED_7,
    UI_SPEED_8,
    UI_SPEED_9, UI_SPEED,
    UI_SPEED_0,
    UI_TOPBAR_MAINMENU,
    UI_BOOLEAN, UI_TOPBAR_SM,
    UI_TOPBAR_TOGGLELIGHTING,
    UI_TOPBAR_VIEWMODE,
    UI_TOPBAR_DESIGNERMODE,
    UI_TOPBAR_FASTLIGHTING
} from "../UIData.js";
import { TopBarToggle } from "./TopBarToggle.js";
import { getLastMoveOffset } from "../../mouse.js";
import { getCurDay, millis_per_day } from "../../climate/time.js";

export class TopBarComponent {
    constructor(key) {
        this.key = key;
        this.hovered = false;
        this.compact = false;

        this.elements = new Map();
        this.elementPositions = new Map();
        this.elements[1] = new Array();

        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_0, () => "⏸"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_1, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_2, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_3, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_4, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_5, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_6, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_7, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_8, () => "▶"));
        this.elements[1].push(new TopBarToggle(getBaseUISize() * 2,"left", UI_SPEED, UI_SPEED_9, () => "▶\t"));
        this.elements[1].push(new TopBarTime(getBaseUISize() * 2, () => this.textDateTime()));


        this.elements[0] = [
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_MAINMENU, UI_BOOLEAN, () => this.textMainMenu()),
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_SM, UI_BOOLEAN, () => this.textBlockMenu()),
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_VIEWMODE, UI_BOOLEAN, () => this.textViewMode()),
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_TOGGLELIGHTING, UI_BOOLEAN, () => this.textToggleLighting()),
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_FASTLIGHTING, UI_BOOLEAN, () => this.textFastLighting()),
            new TopBarToggle(getBaseUISize() * 2, "left", UI_TOPBAR_DESIGNERMODE, UI_BOOLEAN, () => this.textDesignerMode())
        ];

        this.elementPositions[1] = new Array(this.elements[1].length);
        this.elementPositions[0] = new Array(this.elements[0].length);

        this.maxHeight = 0;
        this.padding = 4;
    }

    textMainMenu() {
        if (this.compact)
            return " main |"
        return " main menu |"
    }

    textBlockMenu() {
        if (this.compact)
            return " block |"
        return " block menu |"
    }

    textViewMode() {
        if (this.compact)
            return " viewmode |"
        return " select viewmode |"
    }
    textToggleLighting() {
        if (this.compact) 
            return "lighting | " 
        return "toggle lighting | "
    }
    textFastLighting() {
        if (this.compact)
            return "fast | "
        return "fast lighting | "
    }
    textDesignerMode() {
        if (this.compact) 
            return "designer"
        return "designer mode"
    }

    textDateTime() {
        let curDay = getCurDay();
        let curDate = new Date(curDay * millis_per_day);
        if (this.compact) {
            return curDate.toLocaleTimeString("en-US", {timeZone: 'UTC'}) + " ";
        } else {
            return curDate.toLocaleString("en-US", {timeZone: 'UTC'}) + " ";
        }
    }


    ySize() {
        return this.maxHeight + 3 * this.padding;
    }
    render() {
        if (!loadUI(this.key)) {
            return;
        }

        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(0, 0, getCanvasWidth(), this.ySize());

        let keys = Object.keys(this.elements);
        let curEndX = 0;
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = getCanvasWidth() * key;
            let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ) + this.padding * 4;

            if (key >= 0.5) {
                startX -= totalElementsSizeX;
            }

            if (startX < curEndX) {
                this.compact = true;
                return;
            }
                
            for (let i = 0; i < elements.length; i++) {
                let element = elements[i];
                let measurements = element.measure();
                element.render(startX, this.padding + measurements[1]);
                this.elementPositions[key][i] = startX;
                startX += measurements[0] + this.padding;
                curEndX = startX;
                this.maxHeight = Math.max(measurements[1], this.maxHeight);
            }
        })
    }

    // yeah i'm pretty sorry about this one
    getElementXPositionFunc(elementKey, elementIdx) {
        return this.elementPositions[elementKey][elementIdx];
    }

    update() {
        if (!loadUI(this.key)) {
            return;
        }
        
        var curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        
        var x = curMouseLocation.x;
        var y = curMouseLocation.y;

        if (y > this.maxHeight + (getBaseUISize() * 2)) {
            return;
        }

        let keys = Object.keys(this.elements);
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = getCanvasWidth() * key;
            let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            ) - this.padding * 2;

            if (key >= 0.5) {
                startX -= totalElementsSizeX;
            } else {
                startX += this.padding * 2;
            }
            elements.forEach((element) => {
                let measurements = element.measure();
                let width = measurements[0] + this.padding;

                let lb = (x > startX && x < startX + width);
                let ub = (x > startX - width && x < startX);

                if ((key < 0.5 && lb) || (key >= 0.5 && ub)) {
                    element.hover(x - startX, y);
                    this.hovered = true;
                }
                startX += width;
            });
        })

    }

}