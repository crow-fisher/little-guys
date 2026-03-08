export class GrowthPlanStep {
    constructor(growthPlan, growSqAction) {
        this.growthPlan = growthPlan;
        this.growSqAction = growSqAction;
        this.completed = false;
        this.completedLsq = null;
    }

    doAction() {
        if (this.growSqAction != null) {
            let newLifeSquare = this.growSqAction();
            this.completed = true;
            if (newLifeSquare) {
                this.completedLsq = newLifeSquare;
                newLifeSquare.component = this.growthPlan.component;
                this.growthPlan.component.addLifeSquare(newLifeSquare);
            }
        }
    }
}
