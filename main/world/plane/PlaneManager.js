import { RuntimeComponent } from "../../runtimeComponent.js";

export class PlaneManager extends RuntimeComponent {
    di(mainManager) {
        super.di(mainManager);
        this.inputManager = this.mainManager.inputManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
    }
}