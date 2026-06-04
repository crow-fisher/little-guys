import { Plane } from "./Plane.js";

export class PlaneManager { 
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.plane = new Plane(this);
    }
    
    update() {
        this.plane.update();
    }
    render() {
        this.plane.render();
    }
}