export class Law {
    // Each organism will have its own instance of 'Law'. 
    // This means each one can have its own statistics tracked. 
    constructor() {
        this.airAccepted = 0;
        this.waterAccepted = 0;
        this.dirtAccepted = 0;
        this.energyGiven = 0;
    }

    photosynthesis(air, water, root) {
        var energyOut = Math.min(Math.min(air, water), root);
        this.energyGiven += energyOut;
        this.airAccepted += energyOut;
        this.waterAccepted += energyOut;
        this.dirtAccepted += energyOut;
        return energyOut;
    }
}
