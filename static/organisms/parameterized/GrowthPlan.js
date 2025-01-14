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
        this.areStepsCompleted = () => this.steps.every((step) => step.completed);
        this.postConstruct = () => null;
    }

    getGrowthComponent() {
        return new GrowthComponent(this.posX, this.posY, this.steps.map((step) => step.completedSquare), this.baseDeflection)
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
        this.completedSquare = null;
    }

    doAction() {
        var newLifeSquare = this.action();
        this.completed = true;
        if (newLifeSquare) {    
            this.completedSquare = newLifeSquare;
        }
    }

}

export class GrowthComponent {
    constructor(posX, posY, lifeSquares, baseDeflection) {
        var strengths = lifeSquares.map((lsq) => lsq.strength)
        var xPositions = lifeSquares.map((lsq) => lsq.posX);
        var yPositions = lifeSquares.map((lsq) => lsq.posY);

        var xSize = Math.max(...xPositions) - Math.min(...xPositions);
        var ySize = Math.max(...yPositions) - Math.min(...yPositions);

        this.posX = posX;
        this.posY = posY;

        this.lifeSquares = Array.from(lifeSquares);
        this.baseDeflection = baseDeflection;
        this.currentDeflection = baseDeflection;
        this.deflectionRollingAverage = baseDeflection;
        this.size = (xSize ** 2 + ySize ** 2) ** 0.5;
        this.strength = strengths.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
        this.children = new Array();
    }

    getTotalStrength() {
        return this.strength + this.children.map((gc) => gc.strength).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        );
    }

    getTotalSize() {
        return this.size + this.children.map((gc) => gc.size).reduce(
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