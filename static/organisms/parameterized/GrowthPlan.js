import { getGlobalThetaBase } from "../../index.js";
import { getCurDay } from "../../time.js";
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

    setBaseDeflectionOverTime(deflectionOverTimeList) {
        this.deflectionOverTimeList = deflectionOverTimeList;
        this.component.deflectionOverTimeList = deflectionOverTimeList;
    }

    setBaseRotationOverTime(rotationOverTimeList) {
        this.rotationOverTimeList = rotationOverTimeList;
        this.component.rotationOverTimeList = rotationOverTimeList;
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
        this.setCurrentDeflection(this.getBaseDeflection() + baseCurve);
        this.distToFront = 0;
        this.spawnTime = getCurDay();
    }

    setBaseDeflectionOverTime(deflectionOverTimeList) {
        this.deflectionOverTimeList = deflectionOverTimeList;
        this.growthPlan.deflectionOverTimeList = deflectionOverTimeList;
    }

    setBaseRotationOverTime(rotationOverTimeList) {
        this.rotationOverTimeList = rotationOverTimeList;
        this.growthPlan.rotationOverTimeList = rotationOverTimeList;
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
            return this.theta + getGlobalThetaBase();
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
        var startSpringForce = this.getStartSpringForce();
        var windX = windVec[0] * 0.1;
        var coef = 0.05;

        var endSpringForce = startSpringForce * (1 - coef) + windX * coef;

        // if (endSpringForce < 0) {
        //     endSpringForce = (-endSpringForce) ** 0.25 * -1;
        // } else {
        //     endSpringForce = endSpringForce ** 0.25;
        // }
        endSpringForce = Math.min(endSpringForce, strength);
        endSpringForce = Math.max(endSpringForce, -strength);
        this.setCurrentDeflection(Math.asin(endSpringForce / (strength)));
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
        var ret = this._getBaseRotation();
        if (this.parentComponent != null) {
            ret += this.parentComponent.getBaseRotation();
        }
        return ret;
    }

    _getBaseRotation() {
        if (this.rotationOverTimeList == null) {
            return this.baseRotation;
        } else {
            if (this.rotationOverTimeList.length != 2) {
                alert("just fyi, this is not implemented yet. just send 2 for now and update them through your growth cycles");
            }
            var mapped = this.rotationOverTimeList.map((l) => l[0]);

            var min = Math.min(...mapped);
            var max = Math.max(...mapped);

            var ot = getCurDay() - this.spawnTime;

            if (ot > max) {
                return this.rotationOverTimeList[this.rotationOverTimeList.length - 1][1];
            }
            if (ot < min) {
                return this.rotationOverTimeList[0][1];
            } else { // assuming this has two entries at the moment
                var rel = (ot - min) / (max - min);
                return this.rotationOverTimeList[0][1] * (1 - rel) + this.rotationOverTimeList[1][1] * rel;
            }
        }
    }

    getDistToFront() {
        if (this.parentComponent == null) {
            return this.distToFront;
        } else {
            return this.distToFront + this.parentComponent.getDistToFront();
        }
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

            this.distToFront = offsetX * Math.cos(this.getTheta());
            lsq.distToFront = this.getDistToFront(); 
            offsetX *= Math.sin(this.getTheta());

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
        return Math.sin(this.getBaseDeflection() - this.getDeflectionRollingAverage()) * this.getTotalStrength();
    }

    getDeflectionRollingAverage() {
        if (this.parentComponent == null)
            return this.deflectionRollingAverage;
        return this.deflectionRollingAverage + this.parentComponent.getBaseDeflection();
    }

    getBaseDeflection() {
        if (this.parentComponent == null) 
            return this._getBaseDeflection();
        return this._getBaseDeflection() + this.parentComponent.getBaseDeflection();
    }

    _getBaseDeflection() {
        if (this.deflectionOverTimeList == null) {
            return this.baseDeflection;
        } else {
            if (this.deflectionOverTimeList.length != 2) {
                alert("just fyi, this is not implemented yet. just send 2 for now and update them through your growth cycles");
            }
            var mapped = this.deflectionOverTimeList.map((l) => l[0]);

            var min = Math.min(...mapped);
            var max = Math.max(...mapped);

            var ot = getCurDay() - this.spawnTime;

            if (ot > max) {
                return this.deflectionOverTimeList[this.deflectionOverTimeList.length - 1][1];
            }
            if (ot < min) {
                return this.deflectionOverTimeList[0][1];
            } else {
                var rel = (ot - min) / (max - min);
                return this.deflectionOverTimeList[0][1] * (1 - rel) + this.deflectionOverTimeList[1][1] * rel;
            }
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