import { GrowthComponent } from "./GrowthComponent.js";

export class GrowthPlan {
    constructor(required, endStage, type, xb, yb, zb, xbc, ybc, zbc, strengthMult) {
        this.required = required;
        this.endStage = endStage;
        this.type = type;

        this.steps = new Array();
        this.stepLastExecuted = 0;
        this.component = new GrowthComponent(
            this,
            this.steps.filter((step) => step.completed).map((step) => step.completedLsq),
            xb, -yb, zb, xbc, ybc, zbc, type, strengthMult);
    }

    areStepsCompleted() {
        return this.steps.every((step) => step.completed);
    }

    postConstruct() { };

    setBaseDeflectionOverTime(deflectionOverTimeList) {
        this.deflectionOverTimeList = deflectionOverTimeList;
        this.component.deflectionOverTimeList = deflectionOverTimeList;
    }

    setBaseRotationOverTime(rotationOverTimeList) {
        this.rotationOverTimeList = rotationOverTimeList;
        this.component.rotationOverTimeList = rotationOverTimeList;
    }

    complete() {
        this.postConstruct();
        this.postConstruct = () => { }
    }
}