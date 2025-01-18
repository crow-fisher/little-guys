import { getWindSpeedAtLocation } from "../../wind.js";

const ROLLING_AVERAGE_PERIOD = 50;

export class GrowthPlan {
    constructor(posX, posY, required, endStage, baseDeflection, baseCurve, type) {
        this.posX = posX;
        this.posY = posY;
        this.required = required;
        this.steps = new Array(); // GrowthPlanStep
        this.endStage = endStage;
        this.baseDeflection = baseDeflection;
        this.baseCurve = baseCurve;
        this.type = type;
        this.completed = false;
        this.areStepsCompleted = () => this.steps.every((step) => step.completed);
        this.postConstruct = () => console.warn("Warning: postconstruct not implemented");
        this.component = new GrowthComponent(this, this.steps.filter((step) => step.completed).map((step) => step.completedSquare), baseDeflection, baseCurve, type)
    }

    executePostConstruct() {
        this.postConstruct();
        this.postConstruct = () => null;
    }

}

export class GrowthPlanStep {
    constructor(growthPlan, energyCost, timeCost, timeAccessor, timeSetter, growSqAction, otherAction) {
        this.growthPlan = growthPlan;
        this.energyCost = energyCost;
        this.timeCost = timeCost;
        this.timeGetter = timeAccessor;
        this.timeSetter = timeSetter;
        this.growSqAction = growSqAction;
        this.otherAction = otherAction;
        this.completed = false;
        this.completedSquare = null;
    }

    doAction() {
        if (this.growSqAction != null) {
            var newLifeSquare = this.growSqAction();
            this.completed = true;
            if (newLifeSquare) {
                this.completedSquare = newLifeSquare;
                newLifeSquare.component = this.growthPlan.component;
            }
            this.growthPlan.executePostConstruct();
            this.growthPlan.component.addLifeSquare(newLifeSquare);
        }
        if (this.otherAction != null) {
            this.otherAction();
            this.completed = true;
        }
    }
}
    
export class GrowthComponent {
    constructor(growthPlan, lifeSquares, baseDeflection, baseCurve, type) {
        this.growthPlan = growthPlan;
        this.posX = growthPlan.posX;   
        this.posY = growthPlan.posY;

        this.lifeSquares = Array.from(lifeSquares);
        this.currentDeflection = 0;
        this.deflectionRollingAverage = 10 ** 8;
        this.strength = () => lifeSquares.map((lsq) => lsq.strength).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) * (this.xSize() ** 3) * this.ySize();
        
        this.children = new Array();
        this.baseCurve = baseCurve;
        this.baseDeflection = baseDeflection;
        this.setCurrentDeflection(this.baseDeflection);
        this.type = type;
    }

    addLifeSquare(newLsq) {
        this.children.filter((child) => child.posX == newLsq.posX && child.posY <= newLsq.posY)
            .forEach((child) => child.shiftUp());

        this.lifeSquares.filter((llsq) => llsq.proto == newLsq.proto && llsq.posX == newLsq.posX && llsq.posY <= newLsq.posY)
            .forEach((llsq) => {
                llsq.shiftUp();
            });

        this.lifeSquares.push(newLsq);
    }

    updatePosition(newPosX, newPosY) {
        var dx = newPosX - this.posX;
        var dy = newPosY - this.posY;
        
        this.lifeSquares.forEach((lsq) => lsq.updatePositionDifferential(dx, dy));
        this.children.forEach((child) => child.updatePosition(newPosX, newPosY));

        this.posX = newPosX;
        this.posY = newPosY;
    }

    shiftUp() {
        this.posY -= 1;
        this.lifeSquares.forEach((lsq) => lsq.shiftUp());
        this.children.forEach((child) => child.shiftUp());
    }

    xPositions() {
        return this.lifeSquares.map((lsq) => lsq.posX);
    }

    yPositions() {
        return this.lifeSquares.map((lsq) => lsq.posY);
    }

    xSize() {
        if (this.lifeSquares.length == 0) {
            return 1;
        }
        var xPositions = this.lifeSquares.map((lsq) => lsq.posX);
        return Math.max(...xPositions) - Math.min(...xPositions);
    }

    ySize() {
        if (this.lifeSquares.length == 0) {
            return 1;
        }
        var yPositions = this.lifeSquares.map((lsq) => lsq.posY);
        return Math.max(...yPositions) - Math.min(...yPositions);
    }

    xSizeCur() {
        return this.lifeSquares.length / Math.max(1, this.ySize());
    }

    ySizeCur() {
        return this.lifeSquares.length / Math.max(1, this.xSize());
    }

    addChild(childComponent) {
        if (this.children.indexOf(childComponent) != -1) {
            return;
        }
        this.children.push(childComponent);
    }

    updateDeflectionState() {
        var strength = this.getTotalStrength();
        var windVec = this.getNetWindSpeed();
        var startSpringForce = this.getStartSpringForce() * 100;
        var windX = windVec[0];
        var coef = 0.05;
        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        endSpringForce = Math.min(endSpringForce, strength * 100);
        endSpringForce = Math.max(endSpringForce, -strength * 100);
        this.setCurrentDeflection(Math.asin(endSpringForce / (strength * 100)));
        this.children.forEach((child) => child.updateDeflectionState());
    }

    getDeflectionXAtPosition(posX, posY) {
        return this.lifeSquares.filter((lsq) => lsq.posX == posX && lsq.posY == posY).map((lsq) => lsq.deflectionXOffset).at(0);
    }

    getDeflectionYAtPosition(posX, posY) {
        return this.lifeSquares.filter((lsq) => lsq.posX == posX && lsq.posY == posY).map((lsq) => lsq.deflectionYOffset).at(0);
    }   


    applyDeflectionState(parentComponent) {
        var startDeflectionXOffset = 0;
        var startDeflectionYOffset = 0;
        if (parentComponent != null) {
            startDeflectionXOffset = parentComponent.getDeflectionXAtPosition(this.posX, this.posY);
            startDeflectionYOffset = parentComponent.getDeflectionYAtPosition(this.posX, this.posY);
        }

        var startTheta = this.deflectionRollingAverage - this.baseCurve / 2;
        var endTheta = this.currentDeflection + this.baseCurve / 2;
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

        this.children.forEach((child) => child.applyDeflectionState(this));
    }



    getTotalStrength() {
        return Math.max(1, this.strength() + this.children.map((gc) => gc.strength()).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ));
    }

    getTotalSize() {
        return Math.max(1, this.lifeSquares.length + this.children.map((gc) => this.lifeSquares.length).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ));
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
        if (this.deflectionRollingAverage == 10 ** 8) {
            this.deflectionRollingAverage = deflection;
        } else {
            this.deflectionRollingAverage = this.deflectionRollingAverage * ((ROLLING_AVERAGE_PERIOD - 1) / ROLLING_AVERAGE_PERIOD) + deflection * (1 / ROLLING_AVERAGE_PERIOD);
        }
    }
}