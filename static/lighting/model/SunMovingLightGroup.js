import { getBaseSize } from "../../canvas.js";
import { getCurrentLightColorTemperature, getDaylightStrength } from "../../climate/time.js";
import { loadGD, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y } from "../../ui/UIData.js";
import { LightGroup } from "./lightGroup.js";
import { MovingLightSource } from "./MovingLightSource.js";

export class SunMovingLightGroup extends LightGroup {
    constructor() {
        super();
        this.dist = 100;
        this.numNodes = 5;
        this.init();
        this.idxCompletionMap = new Map();
    }

    init() {
        this.lightSources = [];
        for (let i = 0; i < this.numNodes; i += 1) {
            let newLightSource = new MovingLightSource(
                this.getPositionFunc(i),
                getDaylightStrength,
                getCurrentLightColorTemperature,
                10000
            );
            this.lightSources.push(newLightSource);
        }
    }

    getPositionFunc(idx) {
        return (idx) => [
            loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize(), 
            -10
        ]
    }

    doRayCasting(idx) {
        if (this.idxCompletionMap.get(idx) === false) {
            return false;
        }
        this.idxCompletionMap.set(idx, false)

        let completionMap = new Map();
        for (let i = 0; i < this.lightSources.length; i++) {
            completionMap.set(i, false);
            this.lightSources[i].calculateFrameCloudCover();
            let _i = i;
            this.lightSources[i].doRayCasting(idx, i, () => {
                completionMap.set(_i, true);
                if (completionMap.values().every((val) => val)) {
                    this.idxCompletionMap.set(idx, true);
                }
            });
        };
        return true;
    }
}