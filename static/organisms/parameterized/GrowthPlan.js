import { getWindSpeedAtLocation } from "../../wind.js";

export class GrowthPlan {
    constructor(posX, posY, required, endStage, baseDeflection, springForce) {
        this.posX = posX;
        this.posY = posY;
        this.required = required;
        this.steps = new Array(); // GrowthPlanStep
        this.endStage = endStage;
        this.baseDeflection = baseDeflection;
        this.springForce = springForce;
        this.completed = false;
        this.component = null;
        this.areStepsCompleted = () => this.steps.every((step) => step.completed);
        this.postConstruct = () => console.warn("Warning: postconstruct not implemented");
    }

    getGrowthComponent() {
        if (this.component == null) {
            this.component = new GrowthComponent(this.posX, this.posY, this.steps.filter((step) => step.completed).map((step) => step.completedSquare), this.baseDeflection)
        }
        return this.component;
    }
}

export class GrowthPlanStep {
    constructor(growthPlan, energyCost, timeCost, timeAccessor, timeSetter, action) {
        this.growthPlan = growthPlan;
        this.energyCost = energyCost;
        this.timeCost = timeCost;
        this.timeGetter = timeAccessor;
        this.timeSetter = timeSetter;
        this.action = action;
        this.completed = false;
        this.completedSquare = null;
    }

    doAction() {
        var newLifeSquare = this.action();
        this.completed = true;
        if (newLifeSquare) {
            this.completedSquare = newLifeSquare;
        }
        this.growthPlan.getGrowthComponent().lifeSquares.push(newLifeSquare);
        this.growthPlan.getGrowthComponent().updateDeflectionState();
        this.growthPlan.getGrowthComponent().applyDeflectionState();
    }

}

export class GrowthComponent {
    constructor(posX, posY, lifeSquares, baseDeflection) {
        var strengths = lifeSquares.map((lsq) => lsq.strength)

        this.posX = posX;
        this.posY = posY;

        this.lifeSquares = Array.from(lifeSquares);
        this.baseDeflection = baseDeflection;
        this.currentDeflection = baseDeflection / 2;
        this.deflectionRollingAverage = baseDeflection;
        this.strength = strengths.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
        this.children = new Array();
    }

    size() {
        var xPositions = this.lifeSquares.map((lsq) => lsq.posX);
        var yPositions = this.lifeSquares.map((lsq) => lsq.posY);
        var xSize = Math.max(...xPositions) - Math.min(...xPositions);
        var ySize = Math.max(...yPositions) - Math.min(...yPositions);
        return Math.max(1, (xSize ** 2 + ySize ** 2) ** 0.5);
    }

    addChild(childComponent) {
        if (childComponent in this.children) {
            return;
        }
        this.children.push(childComponent);
    }

    updateDeflectionState() {
        var strength = this.getTotalStrength();
        var length = this.getTotalSize();
        var windVec = this.getNetWindSpeed();
        var startSpringForce = this.getStartSpringForce() / length;

        var windX = windVec[0];
        var coef = 0.5;
        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        endSpringForce = Math.min(endSpringForce, strength * 100);
        endSpringForce = Math.max(endSpringForce, -strength * 100);
        this.setCurrentDeflection(Math.asin(endSpringForce / (strength * 100)));
        this.children.forEach((child) => child.updateDeflectionState());
    }


    applyDeflectionState(parentComponent) {
        var startDeflectionXOffset = 0;
        var startDeflectionYOffset = 0;
        if (parentComponent != null) {
            startDeflectionXOffset = parentComponent.getDeflectionXAtPosition(this.posX, this.posY);
            startDeflectionYOffset = parentComponent.getDeflectionYAtPosition(this.posX, this.posY);
        }

        var startTheta = this.deflectionRollingAverage;
        var endTheta = this.currentDeflection;
        var length = this.getTotalSize();

        var thetaDelta = endTheta - startTheta;

        this.lifeSquares.forEach((lsq) => {
            // relative to origin
            var relLsqX = this.posX - lsq.posX;
            var relLsqY = this.posY - lsq.posY;
            var lsqDist = (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
            var currentTheta = startTheta + (lsqDist / length) * thetaDelta;

            var endX = startDeflectionXOffset + relLsqX * Math.cos(currentTheta) - relLsqY * Math.sin(currentTheta);
            var endY = startDeflectionYOffset + relLsqY * Math.cos(currentTheta) + relLsqX * Math.sin(currentTheta);

            lsq.deflectionXOffset = endX - relLsqX;
            lsq.deflectionYOffset = endY - relLsqY;
        })

        this.children.forEach((child) => child.applyDeflectionState());

    }



    getTotalStrength() {
        return this.strength + this.children.map((gc) => gc.strength).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }

    getTotalSize() {
        return this.size() + this.children.map((gc) => gc.size()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }

    getNetWindSpeed() {
        return this.lifeSquares.map((lsq) => getWindSpeedAtLocation(lsq.posX, lsq.posY)).reduce(
            (accumulator, currentValue) => [accumulator[0] + currentValue[0], accumulator[1] + currentValue[1]],
            [0, 0]
        );
    }

    getStartSpringForce() {
        return Math.sin(this.deflectionRollingAverage - this.baseDeflection) * this.getTotalStrength();
    }

    setCurrentDeflection(deflection) {
        this.currentDeflection = deflection;
        this.deflectionRollingAverage = this.deflectionRollingAverage * 0.9 + deflection * 0.1;
    }
}