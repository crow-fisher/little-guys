import { loadGD, UI_GAME_MAX_CANVAS_SQUARES_X, UI_GAME_MAX_CANVAS_SQUARES_Y, UI_LIGHTING_QUALITY } from "../../ui/UIData.js";
import { LightGroup } from "./lightGroup.js";
import { LightSource } from "./LightSource.js";

export class StationaryWideLightGroup extends LightGroup {
    constructor(centerX, centerY, sizeX, numNodes, colorFunc, brightnessFunc) {
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.sizeX = sizeX;
        this.numNodes = numNodes;
        this.colorFunc = colorFunc;
        this.brightnessFunc = brightnessFunc;
        this.init();
        this.idxCompletionMap = new Map();
    }

    init() {
        this.lightSources = [];
        let step = (this.sizeX / this.numNodes);
        let startX = this.centerX - (this.sizeX / 2);
        for (let i = 0; i < this.numNodes; i += 1) {
            let posX = startX + i * step + step * 0.5;
            let newLightSource = new LightSource(
                posX,
                this.centerY,
                this.brightnessFunc,
                this.colorFunc,
                100,
                Math.ceil((300 / 7) * loadGD(UI_LIGHTING_QUALITY))
            );
            this.lightSources.push(newLightSource);
        }

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
            this.lightSources[i].doRayCasting(idx, _i, () => {
                completionMap.set(_i, true);
                if (completionMap.values().every((val) => val)) {
                    this.idxCompletionMap.set(idx, true);
                }
            });
        };
        return true;
    }
    preRender() {
    }
}
