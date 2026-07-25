import { copyVecValue } from "../../util/vector.js";
import { SphereLightGroup } from "./model/SphereLightGroup.js";

export class LightingManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.inputManager = worldManager.mainManager.inputManager;
        this.cameraManager = worldManager.mainManager.cameraManager;
        this.lightSources = [new SphereLightGroup(this)];
    }

    update() {
        let idx = 0;
        if (this.inputManager.mouseManager.isButtonPressed(1)) {
            copyVecValue(this.cameraManager.cameraOffset, this.lightSources[0].centerCs.world);

            this.lightSources.forEach((ls) => ls.updateInit(idx++));

            this.worldManager.blockManager.iterateOnSectors(
                (sector) => sector.iterateOnBlocks(
                    (block) => this.lightSources.forEach(
                        (ls) => ls.updateProcessBlock(block))));
            this.lightSources.forEach((ls) => ls.updateProcess());
        }

    }

    render() {
        // this.lightSources.forEach((ls) => ls.render());
    }
}