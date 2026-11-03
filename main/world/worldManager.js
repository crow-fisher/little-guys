import { RuntimeComponent } from "../runtimeComponent.js";
import { PlaneManager } from "./plane/PlaneManager.js";
import { StarManager } from "./stars/starManager.js";

export class WorldManager extends RuntimeComponent {
    constructor() {
        super();
        this.starManager = new StarManager(this);

        this.planeManager = new PlaneManager(this);
    }

    di(mainManager) {
        super.di(mainManager);
        this.starManager.di(mainManager);
        this.planeManager.di(mainManager);
        
        this.uiManager = this.mainManager.uiManager;
        this.manipulationComponent = this.uiManager.manipulationComponent;
    }
    postConstruct() {
        this.planeManager.postConstruct();
        this.starManager.postConstruct();
    }

    update() {
        this.starManager.update();
        this.planeManager.update();
        
    }
    render() {
        this.starManager.render();
        this.planeManager.render();
    }
}