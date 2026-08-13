import { RuntimeComponent } from "../../runtimeComponent.js";
import { removeItemOnce } from "../../util/func.js";
import { copyVecValue } from "../../util/vector.js";
import { SphereLightGroup } from "./model/SphereLightGroup.js";

export class LightingManager extends RuntimeComponent {
    constructor(worldManager) {
        super();
        this.worldManager = worldManager;
        this.lightingUpdate = false;
    }

    di() {
        this.inputManager = this.worldManager.mainManager.inputManager;
        this.cameraManager = this.worldManager.mainManager.cameraManager;
    }

    postConstruct() {
        this.lightSources = [new SphereLightGroup(this)];
    }

    addLightToLightModel(lightSource) {
        this.lightSources.push(lightSource);
    }
    removeLightFromLightModel(lightSource) {
        removeItemOnce(this.lightSources, lightSource);
    }

    addBlockToLightModel(block) {
        this.lightSources.forEach((ls) => ls.updateProcessBlock(block));
        this.lightingUpdate = true;
    }
    removeBlockFromLightModel(block) {
        this.lightSources.forEach((ls) => ls.updateRemoveBlock(block));
        this.lightingUpdate = true;
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

        if (this.lightingUpdate) {
            this.lightingUpdate = false;
            this.lightSources.forEach((ls) => ls.updateProcess());
        }
    }

    render() {
        // this.lightSources.forEach((ls) => ls.render());
    }
}