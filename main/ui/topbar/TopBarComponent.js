import { TopBarToggle } from "./TopBarToggle.js";
import { TopBarText } from "./TopBarText.js";
import { MILLIS_PER_DAY } from "../../util/const.js";
import { TopBarToggleFunc } from "./TopBarToggleFunc.js";
import { hsvToHex } from "../../color/color.js";
import { TOPBAR_MAINMENU, TOPBAR_BLOCK, TOPBAR_LIGHTING, TOPBAR_VIEWMODE, TOPBAR_SIMULATION, TOPBAR_TIME, TOPBAR_WEATHER, TOPBAR_ASTRONOMY } from "./topBarEnum.js";
import { RuntimeComponent } from "../../../future/main/runtimeComponent.js";

export class TopBarComponent extends RuntimeComponent {
    constructor(uiManager, key) {
        super();
        this.uiManager = uiManager;
        this.activeFunc = () => true;
        this.key = key;
        this.hovered = false;
        this.compact = false;

        this.veryCompactWidthCutoff = this.uiManager.getBaseUISize() * 70;

        this.elements = new Map();
        this.elementPositions = new Map();

        let fontSize = this.uiManager.getBaseUISize() * 3 * 0.75;
        this.midSpacingEl = new TopBarText(this.uiManager, fontSize, "left", () => " | ")

        let speedElements = [];
        for (let i = 1; i < 10; i++) {
            speedElements.push(new TopBarToggleFunc(this.uiManager, fontSize, "left", () => this.uiManager.getCurTimeScale() == i, () => this.uiManager.setCurTimeScale(i), () => "▶"));
        }

        this.elements[0] = [
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_MAINMENU, () => this.textMainMenu()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_BLOCK, () =>  this.textBlockMenu()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_LIGHTING, () =>  this.textToggleLighting()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_VIEWMODE, () =>  this.textViewMode()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_SIMULATION, () =>  this.textSimulation()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_TIME, () =>  this.textDateTime()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_WEATHER, () =>  this.textWeather()),
            this.midSpacingEl,
            new TopBarToggle(this.uiManager, fontSize, "left", "active", TOPBAR_ASTRONOMY, () =>  "stars"),
            this.midSpacingEl,
            this.midSpacingEl,
            // new TopBarText(this.uiManager, fontSize, "left", () => this.textFps()),
            new TopBarToggleFunc(this.uiManager, fontSize, "left", () => this.uiManager.getCurTimeScale() == 0, () => this.uiManager.setCurTimeScale(0), () => "\u23F8\uFE0E"),
            ...speedElements,
            this.midSpacingEl,
        ];

        Object.keys(this.elements).forEach((key) => this.elementPositions[key] = new Array(this.elements[key].length));

        this.maxHeight = 0;
        this.padding = this.uiManager.getBaseUISize() * (4 / 10);
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
        let curDate = new Date(this.uiManager.getCurDay() * MILLIS_PER_DAY);
        if (this.compact) {
            return curDate.toLocaleTimeString("en-US");
        } else {
            return curDate.toLocaleString("en-US");
        }
    }

    textFps() {
        let frameTime = this.uiManager.mainManager.timeManager.dtRolling;
        let fps = (1 / (frameTime / 1000));
        return fps.toFixed(2) + " fps";
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
        let y = curMouseLocation.y;

        if (y > this.ySize()) {
            return;
        }

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
                    element.interact(x - startX, y);
                    this.hovered = true;
                }
                startX += width;
            });
        })
    }

    render() {
        this.uiManager.getContext().fillStyle = hsvToHex(0, 0, 0);
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
        return this.elementPositions[elementKey][elementIdx] + this.uiManager.getBaseUISize() * 1.95;
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
