import { RuntimeComponent } from "../runtimeComponent.js";
import { LivePlaneManager } from "./plane/LivePlaneManager.js";
import { ManipulationManager } from "./plane/manipulation/ManipulationManager.js";
import { StaticPlaneManager } from "./plane/StaticPlaneManager.js";
import { StarManager } from "./stars/starManager.js";

export class WorldManager extends RuntimeComponent {
    constructor() {
        super();
        this.starManager = new StarManager(this);

        this.manipulationManager = new ManipulationManager(this);
        this.staticPlaneManager = new StaticPlaneManager(this);
        this.livePlaneManager = new LivePlaneManager(this);
    }

    di(mainManager) {
        super.di(mainManager);
        this.starManager.di(mainManager);
        this.staticPlaneManager.di(mainManager);
        this.manipulationManager.di(mainManager);
        
        this.uiManager = this.mainManager.uiManager;
        this.manipulationComponent = this.uiManager.manipulationComponent;
    }
    postConstruct() {
        this.manipulationManager.postConstruct();
        this.starManager.postConstruct();
    }

    update() {
        this.starManager.update();
        this.manipulationManager.update();
        this.staticPlaneManager.update();
        this.livePlaneManager.update();
        
    }
    render() {
        this.starManager.render();
        this.staticPlaneManager.render();
        this.livePlaneManager.render();
    }
}