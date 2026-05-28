import { COLOR_BLACK } from "../../colors.js";
import {
    loadGD,
    UI_SPEED_ONE,
    UI_SPEED_TWO,
    UI_SPEED_THREE,
    UI_SPEED_FOUR,
    UI_SPEED_FIVE,
    UI_SPEED_SIX,
    UI_SPEED_SEVEN,
    UI_SPEED_EIGHT,
    UI_SPEED_NINE, UI_SPEED,
    UI_SPEED_ZERO,
    UI_TOPBAR_MAINMENU,
    UI_BOOLEAN, UI_TOPBAR_BLOCK, UI_TOPBAR_VIEWMODE, UI_TOPBAR_LIGHTING,
    UI_TOPBAR_TIME,
    UI_NAME, UI_TOPBAR_WEATHER, UI_TOPBAR_AA,
    UI_TOPBAR_IBOD
} from "../UIData.js";
import { TopBarToggle } from "./TopBarToggle.js";
import { TopBarText } from "./TopBarText.js";

export class TopBarComponent {
    constructor(uiManager, key) {
        this.uiManager = uiManager;
        this.key = key;
        this.hovered = false;
        this.compact = false;

        this.veryCompactWidthCutoff = this.uiManager.getBaseUISize() * 70;

        this.elements = new Map();
        this.elementPositions = new Map();

        let fontSize = this.uiManager.getBaseUISize() * 3 * 0.75;
        this.midSpacingEl = new TopBarText(this.uiManager, fontSize, "left", () => " | ")

        this.elements[1] = [ 
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_IBOD, UI_BOOLEAN, () => this.textIBOD()),
            this.midSpacingEl,
            new TopBarText(this.uiManager, fontSize, "left", () => this.textWorldName())
        ]
        
        this.elements[0] = [
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_MAINMENU, UI_BOOLEAN, () => this.textMainMenu()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_BLOCK, UI_BOOLEAN, () => this.textBlockMenu()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_VIEWMODE, UI_BOOLEAN, () => this.textViewMode()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_LIGHTING, UI_BOOLEAN, () => this.textToggleLighting()),
            this.midSpacingEl, 
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_AA, UI_BOOLEAN, () => this.textStargazer()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_ZERO, () => "\u23F8\uFE0E"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_ONE, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_TWO, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_THREE, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_FOUR, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_FIVE, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_SIX, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_SEVEN, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_EIGHT, () => "▶"),
            new TopBarToggle(this.uiManager, fontSize,"left", UI_SPEED, UI_SPEED_NINE, () => "▶"),
            // new TopBarTimeSeekLabel(fontSize,"left", () => "⏭"),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_TIME, UI_BOOLEAN,() => this.textDateTime(), this.uiManager.getBaseUISize() * 26.404296875),
            new TopBarToggle(this.uiManager, fontSize, "left", UI_TOPBAR_WEATHER, UI_BOOLEAN, () => " | " + this.textWeather()),
            new TopBarText(this.uiManager, fontSize, "left", () => " | " + this.textFps())
        ];

        Object.keys(this.elements).forEach((key) => this.elementPositions[key] = new Array(this.elements[key].length));

        this.maxHeight = 0;
        this.padding = this.uiManager.getBaseUISize() * (4/10);
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
    textIBOD() {
        if (this.veryCompact) {
            return "IBOD"
        }
        return "IBOD" 
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
            return "sunny"
        } else {
            return "very, very, very sunny"
        }
    }

    textDateTime() {
        return "time placeholder"
        // let curDay = getCurDay();
        // let dayMillis = curDay * millis_per_day;
        // dayMillis -= (dayMillis % 1000);
        // let curDate = new Date(dayMillis);
        // let curSecond = Math.floor(curDate.getSeconds());
        // let test = this.numSquareCountSecond == null || curSecond != this.numSquareCountSecond;
        // if (test) {
        //     this.shouldUpdate = 2;
        //     this.numSquareCountSecond = curSecond;
        // } else {
        //     this.shouldUpdate = Math.max(0, this.shouldUpdate - 1);
        // }

        // return curDate.toLocaleString("en-US");
        // if (this.compact) {
        //     return curDate.toLocaleTimeString("en-US");
        // } else {
        // }
    }

    textFps() {
        return "text fps";
        // let frameTime = getFrameDt();
        // let fps = (1 / (frameTime / 1000));

        // if (this.shouldUpdate || getTimeScale() == 0) {
        //     this.numSquareCount = getFrameSimulationSquares().length;
        //     // this.soilTotalSum = getFrameSimulationSquares().filter((sq) => sq.proto == "SoilSquare").map((sq) => sq.blockHealth).reduce((a, b) => a + b, 0);
        //     if (fps < 10)
        //         this.fpsCache = fps.toFixed(1);
        //     else
        //         this.fpsCache = Math.round(fps);
        // }

        // return this.fpsCache + " fps" + " | " 
        //     // + this.numSquareCount + " squares" + " | " 
        //     + getNoSortRenderJobsLength() + " stars"
    }


    ySize() {
        return this.maxHeight + 3 * this.padding;
    }

    update() {
        let curMouseLocation = this.uiManager.mousePosition();
        if (curMouseLocation == null || !this.uiManager.isFrameButtonPressed(0)) {
            return;
        }
        
        let x = curMouseLocation.x;
        let y = curMouseLocation.y - this.phoneModeOffset;
        let keys = Object.keys(this.elements);
        keys.map(parseFloat).forEach((key) => {
            let elements = this.elements[key];
            let startX = this.uiManager.getWidth() * key;
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

    render() {
        this.uiManager.getContext().fillStyle = COLOR_BLACK;
        this.uiManager.getContext().fillRect(0, 0, this.uiManager.getWidth(), this.ySize());
        let order = Array.from(Object.keys(this.elements).map(parseFloat)).sort()
        let curEndX = 0;
        order.forEach((key) => {
            let elements = this.elements[key];
            let startX = (key == 0 ? this.uiManager.getBaseUISize() * 1 : 0) + this.uiManager.getWidth() * key;
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
        if (elementIdx == 0) {
            return 0;
        }
        return this.elementPositions[elementKey][elementIdx] + this.uiManager.getBaseUISize() * 1.95   ;
    }

    // update() {
    //     if (!loadGD(this.key)) {
    //         return;
    //     }
        
    //     let curMouseLocation = getLastMoveOffset();
    //     if (curMouseLocation == null) {
    //         return;
    //     }
        
    //     let x = curMouseLocation.x;
    //     let y = curMouseLocation.y - this.phoneModeOffset;

    //     if (y > this.maxHeight + (this.uiManager.getBaseUISize())) {
    //         return;
    //     }

    //     let keys = Object.keys(this.elements);
    //     keys.map(parseFloat).forEach((key) => {
    //         let elements = this.elements[key];
    //         let startX = this.this.uiManager.getWidth() * key;
    //         let totalElementsSizeX = elements.map((element) => element.measure()).map((measurements) => measurements[0] + this.padding).reduce(
    //             (accumulator, currentValue) => accumulator + currentValue,
    //             0,
    //         );

    //         if (key >= 0.5) {
    //             startX -= totalElementsSizeX;
    //         } else {
    //             startX += this.padding * 2;
    //         }
    //         elements.forEach((element) => {
    //             let measurements = element.measure();
    //             let width = measurements[0] + this.padding;

    //             if (x > startX && x < startX + measurements[0]) {
    //                 element.hover(x - startX, y);
    //                 this.hovered = true;
    //             }
    //             startX += width;
    //         });
    //     })

    // }
}
