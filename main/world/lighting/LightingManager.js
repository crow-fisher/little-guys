import { addVec3Mult, copyVecValue } from "../../util/vector.js";
import { LightGroup } from "./model/LightGroup.js";
import { LightSource } from "./model/LightSource.js";

export class LightingManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.inputManager = worldManager.mainManager.inputManager;
        this.cameraManager = worldManager.mainManager.cameraManager;
        this.lightSources = [new LightGroup(this)];
    }

    update() {
        let idx = 0;
        if (this.inputManager.mouseManager.isButtonPressed(1)) {
            copyVecValue(this.cameraManager.cameraOffset, this.lightSources[0].centerCs.world);
            copyVecValue(this.cameraManager.right, this.lightSources[0].right);
            copyVecValue(this.cameraManager.up, this.lightSources[0].up);
            copyVecValue(this.cameraManager.forward, this.lightSources[0].forward);
        }
        
        this.lightSources.forEach((ls) => ls.updateInit(idx++));


        this.worldManager.blockManager.iterateOnSectors(
            (sector) => sector.iterateOnBlocks(
                (block) => this.lightSources.forEach(
                    (ls) => ls.updateProcessBlock(block))));
        this.lightSources.forEach((ls) => ls.updateProcess());
    }

    render() {
        this.lightSources.forEach((ls) => ls.render());
    }
}