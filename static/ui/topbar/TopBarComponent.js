import { getBaseUISize, getCanvasWidth } from "../../canvas.js";
import { COLOR_BLACK } from "../../colors.js";
import { MAIN_CONTEXT } from "../../index.js";
import {
    loadGD,
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
    UI_BOOLEAN, UI_TOPBAR_BLOCK, UI_TOPBAR_VIEWMODE,
    UI_TOPBAR_SIMULATION, UI_TOPBAR_LIGHTING,
    UI_TOPBAR_TIME,
    UI_NAME, UI_TOPBAR_WEATHER,
    loadUI,
    UI_UI_PHONEMODE,
    UI_TOPBAR_STARGAZER
} from "../UIData.js";
import { TopBarToggle } from "./TopBarToggle.js";
import { getLastMoveOffset } from "../../mouse.js";
import { getCurDay, getFrameDt, getTimeScale, millis_per_day } from "../../climate/time.js";
import { TopBarText } from "./TopBarText.js";
import { getCurWeather } from "../../climate/weather/weatherManager.js";
import { getWindSquareAbove } from "../../climate/simulation/wind.js";
import { getSqIterationOrder } from "../../squares/_sqOperations.js";
import { getFrameSimulationSquares } from "../../globalOperations.js";
import { TopBarTimeSeekLabel } from "./TopBarTimeSeekLabel.js";

export class TopBarComponent {
    constructor(key) {
        this.key = key;
        this.hovered = false;
        this.compact = false;
        this.phoneModeOffset = 0;

        this.viewAsTwoRowsWidthCutoff = getBaseUISize() * 135;
        this.veryCompactWidthCutoff = getBaseUISize() * 70;

        this.elements = new Map();
        this.elementPositions = new Map();

        let fontSize = getBaseUISize() * 3 * 0.75;
        this.elements[1] = [
            new TopBarText(fontSize, "left", () => this.textWorldName())
        ]

        this.midSpacingEl = new TopBarText(fontSize, "left", () => " | ")
        
        this.elements[0] = [
            new TopBarToggle(fontSize, "left", UI_TOPBAR_MAINMENU, UI_BOOLEAN, () => this.textMainMenu()),
            this.midSpacingEl,
            new TopBarToggle(fontSize, "left", UI_TOPBAR_BLOCK, UI_BOOLEAN, () => this.textBlockMenu()),
            this.midSpacingEl,
            new TopBarToggle(fontSize, "left", UI_TOPBAR_VIEWMODE, UI_BOOLEAN, () => this.textViewMode()),
            this.midSpacingEl,
            new TopBarToggle(fontSize, "left", UI_TOPBAR_LIGHTING, UI_BOOLEAN, () => this.textToggleLighting()),
            this.midSpacingEl, 
            new TopBarToggle(fontSize, "left", UI_TOPBAR_STARGAZER, UI_BOOLEAN, () => this.textStargazer()),
            this.midSpacingEl,
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_0, () => "\u23F8\uFE0E"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_1, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_2, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_3, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_4, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_5, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_6, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_7, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_8, () => "▶"),
            new TopBarToggle(fontSize,"left", UI_SPEED, UI_SPEED_9, () => "▶"),
            new TopBarTimeSeekLabel(fontSize,"left", () => "⏭"),
            this.midSpacingEl,
            new TopBarToggle(fontSize, "left", UI_TOPBAR_TIME, UI_BOOLEAN,() => this.textDateTime(), getBaseUISize() * 26.404296875),
            new TopBarToggle(fontSize, "left", UI_TOPBAR_WEATHER, UI_BOOLEAN, () => " | " + this.textWeather()),
            new TopBarText(fontSize, "left", () => " | " + this.textFps())
        ];

        Object.keys(this.elements).forEach((key) => this.elementPositions[key] = new Array(this.elements[key].length));

        this.maxHeight = 0;
        this.padding = getBaseUISize() * (4/10);
    }

    textMainMenu() {
        return "main"
    }

    textBlockMenu() {
        return "place"
    }
    textClimateMenu() {
        if (this.veryCompact) {
            return "clim"
        }
        return "climate"
    }
    textViewMode() {
        if (this.veryCompact) {
            return "view"
        }
        return "viewmode"
    }
    textToggleLighting() {
        if (this.veryCompact) {
            return "light"
        }
        return "lighting" 
    }
    textStargazer() {
        if (this.veryCompact) {
            return "stars"
        }
        return "stars" 
    }
    textSimulation() {
        if (this.veryCompact) {
            return "sim"
        }
        return "simulation"
    }
    textWorldName() {
        return loadGD(UI_NAME);
    }

    textWeather() {
        if (this.weatherStringCache == null) {
            this.weatherStringCache = this._textWeather();
            this.nextWeatherStringCache = this._textWeather();
        }
        if (this.shouldUpdate) {
            this.weatherStringCache = this.nextWeatherStringCache;
            this.nextWeatherStringCache = this._textWeather();
        }
        return this.weatherStringCache;
    }

    _textWeather() {
        if (this.compact) {
            return getCurWeather().weatherStringShort();
        } else {
            return getCurWeather().weatherStringLong();
        }
    }

    textDateTime() {
        let curDay = getCurDay();
        let dayMillis = curDay * millis_per_day;
        dayMillis -= (dayMillis % 1000);
        let curDate = new Date(dayMillis);
        let curSecond = Math.floor(curDate.getSeconds());
        let test = this.numSquareCountSecond == null || curSecond != this.numSquareCountSecond;
        if (test) {
            this.shouldUpdate = 2;
            this.numSquareCountSecond = curSecond;
        } else {
            this.shouldUpdate = Math.max(0, this.shouldUpdate - 1);
        }

        return curDate.toLocaleString("en-US");
        if (this.compact) {
            return curDate.toLocaleTimeString("en-US");
        } else {
        }
    }

    textFps() {
        let frameTime = getFrameDt();
        let fps = (1 / (frameTime / 1000));

        if (this.shouldUpdate || getTimeScale() == 0) {
            this.numSquareCount = getFrameSimulationSquares().length;
            // this.soilTotalSum = getFrameSimulationSquares().filter((sq) => sq.proto == "SoilSquare").map((sq) => sq.blockHealth).reduce((a, b) => a + b, 0);
            if (fps < 10)
                this.fpsCache = fps.toFixed(1);
            else
                this.fpsCache = Math.round(fps);
        }

        return this.fpsCache + " fps" + " | " + this.numSquareCount + " squares"; // + " | " + this.soilTotalSum + " total soil"
    }


    ySize() {
        return this.maxHeight + 3 * this.padding + this.phoneModeOffset;
    }

    render2Row() {
        this.compact = true;
        if (getCanvasWidth() < this.veryCompactWidthCutoff) {
            this.veryCompact = true;
        }

        let curEndX = 0;
        let curStartY = 0;
        let key = 0;

        let elements = this.elements[key];
        let startX = getCanvasWidth() * key;
        let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );

        if (key >= 0.5) {
            startX -= totalElementsSizeX;
        }


        let topBarElements = elements.slice(0, 11);
        let topBarElementsToRender = Array.from(topBarElements.filter((el) => el != this.midSpacingEl));
        topBarElementsToRender.forEach((el) => el.textAlign = "center")
        let step = getCanvasWidth() / topBarElementsToRender.length;

        for (let i = 0; i < topBarElementsToRender.length; i++) {
            let element = topBarElementsToRender[i];
            let measurements = element.measure();
            element.render(startX + step/2, curStartY + this.padding + measurements[1]);
            startX += step;
            // startX += measurements[0] + this.padding;

            this.maxHeight = Math.max(measurements[1], this.maxHeight);

        }        
    }

    render1Row() {
        let order = Array.from(Object.keys(this.elements).map(parseFloat)).sort()
        let curEndX = 0;
        order.forEach((key) => {
            let elements = this.elements[key];
            let startX = (key == 0 ? getBaseUISize() * 1 : 0) + getCanvasWidth() * key;
            let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );

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
                element.render(startX, this.phoneModeOffset + this.padding + measurements[1]);
                this.elementPositions[key][i] = startX;
                startX += measurements[0] + this.padding;
                curEndX = startX;
                this.maxHeight = Math.max(measurements[1], this.maxHeight);
            }
        })
    }
    render() {
        if (!loadGD(this.key)) {
            return;
        }
        
        this.phoneModeOffset = (loadUI(UI_UI_PHONEMODE) ? getBaseUISize() * 3 : 0);

        let shouldRenderAsTwoRows = getCanvasWidth() < this.viewAsTwoRowsWidthCutoff;
        MAIN_CONTEXT.fillStyle = COLOR_BLACK;
        MAIN_CONTEXT.fillRect(0, this.phoneModeOffset, getCanvasWidth() + 10, this.ySize() - this.phoneModeOffset);
        this.render1Row();
        // if (shouldRenderAsTwoRows) {
        //     this.render2Row();
        // } else {
        //     this.render1Row();
        // }
        
    }

    // yeah i'm pretty sorry about this one
    getElementXPositionFunc(elementKey, elementIdx) {
        if (elementIdx == 0) {
            return 0;
        }
        return this.elementPositions[elementKey][elementIdx] + getBaseUISize() * 1.95   ;
    }

    update() {
        if (!loadGD(this.key)) {
            return;
        }
        
        let curMouseLocation = getLastMoveOffset();
        if (curMouseLocation == null) {
            return;
        }
        
        let x = curMouseLocation.x;
        let y = curMouseLocation.y - this.phoneModeOffset;

        if (y > this.maxHeight + (getBaseUISize())) {
            return;
        }

        let keys = Object.keys(this.elements);
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = getCanvasWidth() * key;
            let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );

            if (key >= 0.5) {
                startX -= totalElementsSizeX;
            } else {
                startX += this.padding * 2;
            }
            elements.forEach((element) => {
                let measurements = element.measure();
                let width = measurements[0] + this.padding;

                if (x > startX && x < startX + measurements[0]) {
                    element.hover(x - startX, y);
                    this.hovered = true;
                }
                startX += width;
            });
        })

    }
}
