import { getWindSpeedAtLocation } from "../../wind.js";

const ROLLING_AVERAGE_PERIOD = 200;

export class GrowthPlan {
    constructor(posX, posY, required, endStage, theta, baseRotation, baseDeflection, baseCurve, type, strengthMult) {
        this.posX = posX;
        this.posY = posY;
        this.required = required;
        this.steps = new Array(); // GrowthPlanStep
        this.endStage = endStage;
        this.theta = theta;
        this.baseRotation = baseRotation;
        this.baseDeflection = baseDeflection;
        this.baseCurve = baseCurve;
        this.type = type;
        this.completed = false;
        this.stepLastExecuted = 0;
        this.areStepsCompleted = () => this.steps.every((step) => step.completed);
        this.postConstruct = () => console.warn("Warning: postconstruct not implemented");
        this.postComplete = () => null;
        this.component = new GrowthComponent(this, this.steps.filter((step) => step.completed).map((step) => step.completedSquare), theta, baseRotation, baseDeflection, baseCurve, type, strengthMult)
    }

    complete() {
        this.completed = true; 
        this.postComplete();
    }

    executePostConstruct() {
        this.postConstruct();
        this.postConstruct = () => null;
    }

}

export class GrowthPlanStep {
    constructor(growthPlan, energyCost, timeCost, growSqAction, otherAction) {
        this.growthPlan = growthPlan;
        this.energyCost = energyCost;
        this.timeCost = timeCost;
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
    constructor(growthPlan, lifeSquares, theta, baseRotation, baseDeflection, baseCurve, type, strengthMult) {
        this.growthPlan = growthPlan;
        this.lifeSquares = lifeSquares;
        this.theta = theta;
        this.baseRotation = baseRotation;
        this.baseDeflection = baseDeflection;
        this.baseCurve = baseCurve;
        this.type = type;

        this.posX = growthPlan.posX;   
        this.posY = growthPlan.posY;

        this.currentDeflection = 0;
        this.deflectionRollingAverage = 10 ** 8;
        this.strength = () => strengthMult * this.lifeSquares.map((lsq) => lsq.strength).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ) * (this.xSize()) / this.ySize();
        
        this.children = new Array();
        this.parentComponent = null;
        this.setCurrentDeflection(this.getBaseDeflection());
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
        if (this.lifeSquares.length <= 1) {
            return 1;
        }
        var xPositions = this.lifeSquares.map((lsq) => lsq.posX);
        return Math.max(...xPositions) - Math.min(...xPositions);
    }

    getTheta() {
        if (this.parentComponent == null) {
            return this.theta;
        }
        return this.theta + this.parentComponent.getTheta();
    }

    ySize() {
        if (this.lifeSquares.length <= 1) {
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
        childComponent.parentComponent = this;
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

    getCurrentDeflection() {
        if (this.parentComponent == null) {
            return this.currentDeflection;
        } else {
            return this.currentDeflection + this.parentComponent.getCurrentDeflection();
        }
    }

    getBaseRotation() {
        var ret = this.baseRotation;
        if (this.parentComponent != null) {
            ret += this.parentComponent.getBaseRotation();
            ret += this.parentComponent.getCurrentDeflection();
        }
        return ret;
    }


    applyDeflectionState(parentComponent) {
        var startDeflectionXOffset = 0;
        var startDeflectionYOffset = 0;
        if (parentComponent != null) {
            startDeflectionXOffset = parentComponent.getDeflectionXAtPosition(this.posX, this.posY);
            startDeflectionYOffset = parentComponent.getDeflectionYAtPosition(this.posX, this.posY);
        }

        var curve = this.baseCurve + Math.sin(this.currentDeflection) * 0.06 * this.ySizeCur() / this.getTotalStrength();
        
        var startTheta = this.deflectionRollingAverage + this.getBaseRotation();
        var endTheta = this.currentDeflection + curve + this.getBaseRotation();

        var length = this.ySizeCur();

        var thetaDelta = endTheta - startTheta;

        this.lifeSquares.forEach((lsq) => {
            // relative to origin
            var relLsqX = this.posX - lsq.posX;
            var relLsqY = this.posY - lsq.posY;
            var lsqDist = (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
            var currentTheta = startTheta + (lsqDist / length) * thetaDelta;

            var offsetX = relLsqX * Math.cos(currentTheta) - relLsqY * Math.sin(currentTheta);
            var offsetY = relLsqY * Math.cos(currentTheta) + relLsqX * Math.sin(currentTheta);

            if (this.getTheta() != 0) {
                offsetX *= Math.sin(this.getTheta());
            }

            var endX = startDeflectionXOffset + offsetX; 
            var endY = startDeflectionYOffset + offsetY; 

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

    getTotalLifeSquares() {
        return Math.max(1, this.lifeSquares.length + this.children.map((gc) => this.lifeSquares.length).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ));
    }

    getNetWindSpeed() {
        return this.lifeSquares.map((lsq) => getWindSpeedAtLocation(lsq.posX + lsq.deflectionXOffset, lsq.posY + lsq.deflectionYOffset)).reduce(
            (accumulator, currentValue) => [accumulator[0] + currentValue[0], accumulator[1] + currentValue[1]],
            [0, 0]
        );
    }

    getStartSpringForce() {
        return Math.sin(this.deflectionRollingAverage - this.getBaseDeflection()) * this.getTotalStrength();
    }

    getBaseDeflection() {
        if (this.parentComponent == null) {
            return this.baseDeflection;
        } else {
            return this.baseDeflection + this.parentComponent.getBaseDeflection();
        }
    }

    setCurrentDeflection(deflection) {
        this.currentDeflection = deflection;
        if (this.parentComponent != null) {
            this.currentDeflection -= this.parentComponent.getCurrentDeflection();
        }
        if (this.deflectionRollingAverage == 10 ** 8) {
            this.deflectionRollingAverage = deflection;
        } else {
            this.deflectionRollingAverage = this.deflectionRollingAverage * ((ROLLING_AVERAGE_PERIOD - 1) / ROLLING_AVERAGE_PERIOD) + deflection * (1 / ROLLING_AVERAGE_PERIOD);
        }
    }
}