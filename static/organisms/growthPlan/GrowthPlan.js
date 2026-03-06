export class GrowthPlan {
    constructor(required, endStage, type, theta, sin, phi, thetaCurve, sinCurve, phiCurve, strengthMult) {
        this.required = required;
        this.endStage = endStage;
        this.type = type;

        this.steps = new Array();
        this.stepLastExecuted = 0;
        this.component = new GrowthComponent(
            this,
            this.steps.filter((step) => step.completed).map((step) => step.completedLsq),
             theta, sin, phi, thetaCurve, sinCurve, phiCurve, type, strengthMult);
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