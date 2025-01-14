export class GrowthPlan {
    constructor(required, endStage) {
        this.required = required;
        this.steps = new Array(); // GrowthPlanStep
        this.endStage = endStage;
        this.completed = () => this.steps.every((step) => step.completed);
    }
}

export class GrowthPlanStep {
    constructor(energyCost, timeCost, timeAccessor, timeSetter, action) {
        this.energyCost = energyCost;
        this.timeCost = timeCost;
        this.timeGetter = timeAccessor;
        this.timeSetter = timeSetter;
        this.action = action;
        this.completed = false;
    }
}