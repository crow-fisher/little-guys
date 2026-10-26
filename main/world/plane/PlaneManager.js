import { RuntimeComponent } from "../../runtimeComponent.js";
import { Plane } from "./manipulation/model/Plane.js";

export class PlaneManager extends RuntimeComponent {
    di(mainManager) {
        super.di(mainManager);
        this.inputManager = this.mainManager.inputManager;
        this.mouseManager = this.mainManager.inputManager.mouseManager;
        
        this.activePlane = new Plane();
    }
    
}