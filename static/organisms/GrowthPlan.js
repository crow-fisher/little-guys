import { getCurDay, getFrameDt } from "../climate/time.js";
import { getWindSpeedAtLocation } from "../climate/simulation/wind.js";
import { STATE_DESTROYED, TYPE_HEART } from "./Stages.js";
import { getGlobalThetaBase } from "../globals.js";
import { removeItemAll } from "../common.js";

export class GrowthPlan {
    constructor(posX, posY, required, endStage, theta, twist, baseRotation, baseDeflection, baseCurve, type, strengthMult, rollingAveragePeriod=200) {
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
        this.stepLastExecuted = 0;
        this.component = new GrowthComponent(
            this,
            this.steps.filter((step) => step.completed).map((step) => step.completedSquare),
            theta, twist, baseRotation, baseDeflection, baseCurve, type, strengthMult, rollingAveragePeriod)
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

export class GrowthPlanStep {
    constructor(growthPlan, growSqAction) {
        this.growthPlan = growthPlan;
        this.growSqAction = growSqAction;
        this.completed = false;
        this.completedSquare = null;
    }

    doAction() {
        if (this.growSqAction != null) {
            let newLifeSquare = this.growSqAction();
            this.completed = true;
            if (newLifeSquare) {
                this.completedSquare = newLifeSquare;
                newLifeSquare.component = this.growthPlan.component;
                this.growthPlan.component.addLifeSquare(newLifeSquare);
            }
        }
    }
}

export class GrowthComponent {
    constructor(growthPlan, lifeSquares, theta, twist, baseRotation, baseDeflection, baseCurve, type, strengthMult, rollingAveragePeriod) {
        this.growthPlan = growthPlan;
        this.lifeSquares = lifeSquares;
        this.theta = theta;
        this.twist = twist;
        this.baseRotation = baseRotation;
        this.baseDeflection = baseDeflection;
        this.baseCurve = baseCurve;
        this.type = type;

        this.posX = growthPlan.posX;
        this.posY = growthPlan.posY;

        this.xOffset = 0;
        this.yOffset = 0;

        this.currentDeflection = 0;
        this.deflectionRollingAverage = 0;
        this.strengthMult = strengthMult;
        this.rollingAveragePeriod = rollingAveragePeriod
        this.children = new Array();
        this.parentComponent = null;
        this.setCurrentDeflection(baseDeflection);
        this.distToFront = 0;
        this.spawnTime = getCurDay();

        this.lastDeflectionInstant = 0;
        this.lastDeflectionValue = [0, 0];
    }

    getChildPath(searchChild) {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child == searchChild) {
                return [i];
            }
            let childSearch = child.getChildPath(searchChild);
            if (childSearch !== -1) {
                return [i, ...childSearch]
            }
        }
        return -1;
    }

    getChildFromPath(childPath) {
        if (childPath.length == 1) {
            return this.children.at(childPath);
        } else {
            return this.children.at(childPath.at(0)).getChildFromPath(childPath.slice(1));
        }
    }

    strength() {
        return this.strengthMult * (this.xSize()) / this.ySize();
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
        let compareFunc = (lsq) => {
            let relLsqX = (this.posX - lsq.posX);
            let relLsqY = (this.posY - lsq.posY);
            return (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
        }
        this.lifeSquares.sort((a, b) => compareFunc(a) - compareFunc(b));
    }

    updatePosition(newPosX, newPosY) {
        let dx = newPosX - this.posX;
        let dy = newPosY - this.posY;

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
        let xPositions = this.lifeSquares.map((lsq) => lsq.posX);
        return 1 + Math.max(...xPositions) - Math.min(...xPositions);
    }

    getTheta() {
        if (this.parentComponent == null) {
            return this.theta + getGlobalThetaBase();
        }
        return this.theta + this.parentComponent.getTheta();
    }

    getTwist() {
        if (this.parentComponent == null) {
            return this.twist;
        }
        return this.twist + this.parentComponent.getTwist();
    }

    ySize() {
        let yPositions = this.lifeSquares.map((lsq) => lsq.posY);
        return 1 + Math.max(...yPositions) - Math.min(...yPositions);
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
        if (this.lifeSquares.some((lsq) => lsq == null)) {
            return;
        }

        let strength = this.getTotalStrength();
        let windVec = this.getNetWindSpeed();
        let startSpringForce = this.getStartSpringForce();
        let windX = Math.sin(this.getTheta()) * windVec[0] * 0.1;
        let coef = 0.05;

        let endSpringForce = startSpringForce * (1 - coef) + windX * coef;
        endSpringForce = Math.min(endSpringForce, strength);
        endSpringForce = Math.max(endSpringForce, -strength);

        this.setCurrentDeflection(Math.asin((endSpringForce / (strength))));
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
            return this.currentDeflection + this.baseDeflection;
        } else {
            return this.currentDeflection + this.baseDeflection + this.parentComponent.getCurrentDeflection();
        }
    }

    getBaseRotation() {
        let ret = this._getBaseRotation();
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
            let mapped = this.rotationOverTimeList.map((l) => l[0]);

            let min = Math.min(...mapped);
            let max = Math.max(...mapped);

            let ot = getCurDay() - this.spawnTime;

            if (ot > max) {
                return this.rotationOverTimeList[this.rotationOverTimeList.length - 1][1];
            }
            if (ot < min) {
                return this.rotationOverTimeList[0][1];
            } else { // assuming this has two entries at the moment
                let rel = (ot - min) / (max - min);
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

    getParentDeflection() {
        if (this.parentComponent == null) {
            return 0;
        } else {
            return Math.cos(this.twist) * Math.cos(this.theta) * (this.parentComponent.currentDeflection + this.parentComponent.getParentDeflection());
        }
    }

    _getWilt(val) {
        return Math.sin(val) / 2;
    }

    getWilt() {
        if (this.lifeSquares.length == 0) {
            return 0;
        }
        return this._getWilt(this.lifeSquares.at(0).linkedOrganism.getWilt());
    }

    applyDeflectionState(parentComponent) {
        if (this.lifeSquares.some((lsq) => lsq == null)) {
            return;
        }

        let startDeflectionXOffset = 0;
        let startDeflectionYOffset = 0;
        if (parentComponent != null) {
            startDeflectionXOffset = parentComponent.getDeflectionXAtPosition(this.posX, this.posY);
            startDeflectionYOffset = parentComponent.getDeflectionYAtPosition(this.posX, this.posY);
        }

        let curve = this.baseCurve + Math.sin(this.currentDeflection) * 0.06 * (this.ySizeCur() - 1) / this.getTotalStrength();

        let startTheta = this.deflectionRollingAverage + this.getParentDeflection() + this.getBaseRotation();
        let endTheta = this.currentDeflection + curve + this.getParentDeflection() - this.baseCurve * this.getWilt() + this.getBaseRotation();

        let length = this.ySizeCur();

        let thetaDelta = endTheta - startTheta;

        let prevX = -1;
        let prevY = -1;

        this.lifeSquares.forEach((lsq) => {
            // relative to origin
            let relLsqX = 0.85 * (this.posX - lsq.posX);
            let relLsqY = 0.85 * (this.posY - lsq.posY);
            let lsqDist = (relLsqX ** 2 + relLsqY ** 2) ** 0.5;
            let currentTheta = startTheta + (lsqDist / length) * thetaDelta;

            let offsetX = relLsqX * Math.cos(currentTheta) - relLsqY * Math.sin(currentTheta);
            let offsetY = relLsqY * Math.cos(currentTheta) + relLsqX * Math.sin(currentTheta);

            this.distToFront = offsetX * Math.cos(this.getTheta());
            lsq.distToFront = this.getDistToFront();
            offsetX *= Math.sin(this.getTheta());
            offsetY *= Math.cos(this.getTwist());

            let endX = startDeflectionXOffset + offsetX;
            let endY = startDeflectionYOffset + offsetY;

            lsq.deflectionXOffset = (endX - relLsqX) + this.xOffset;
            lsq.deflectionYOffset = (endY - relLsqY) + this.yOffset;
            

            if (prevX == -1 && this.parentComponent != null) {
                let plsq = this.parentComponent.lifeSquares.at(this.parentComponent.lifeSquares.length - 1);
                lsq.theta = Math.atan((lsq.getPosY() - plsq.getPosY()) / (lsq.getPosX() - plsq.getPosX())) + Math.PI / 2;
            }
            if (prevX != -1) {
                lsq.theta = Math.atan((lsq.getPosY() - prevY) / (lsq.getPosX() - prevX)) + Math.PI / 2;
            }

            prevX = lsq.getPosX();
            prevY = lsq.getPosY();

            lsq.xRef = 1;
            lsq.yRef = 0.5;
        })

        this.children.forEach((child) => child.applyDeflectionState(this));
    }

    getTotalStrength() {
        return Math.max(.0001, this.strength());
    }

    getTotalLifeSquares() {
        return Math.max(1, this.lifeSquares.length + this.children.map((gc) => this.lifeSquares.length).reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0,
        ));
    }

    getNetWindSpeed() {
        let ret = this._getNetWindSpeed();
        this.children.forEach((child) => {
            let childWs = child.getNetWindSpeed();
            ret[0] += childWs[0];
            ret[1] += childWs[1];
        });
        return ret;
    }
    _getNetWindSpeed() {
        if (getCurDay() != this.lastDeflectionInstant) {
            this.lastDeflectionInstant = getCurDay();
            this.lastDeflectionValue = this.lifeSquares
                .map((lsq) => getWindSpeedAtLocation(lsq.getPosX(), lsq.getPosY())).reduce(
                (accumulator, currentValue) => [accumulator[0] + currentValue[0], accumulator[1] + currentValue[1]],
                [0, 0]
            );
        }
        // this caching implementation saves around 2 fps for 12.5k squares @ 12fps
        // but it causes this weird 'tweaking' behavior
        // so it's disabled for now
        this.lastDeflectionInstant = 0;
        return this.lastDeflectionValue;

    }
    getStartSpringForce() {
        return Math.sin(this.getBaseDeflection() - this.deflectionRollingAverage) * this.getTotalStrength();
    }

    getBaseDeflection() {
        if (this.parentComponent == null) {
            return this._getBaseDeflection();
        } else {
            return this._getBaseDeflection() + this.parentComponent.getBaseDeflection();
        }
    }

    _getBaseDeflection() {
        if (this.deflectionOverTimeList == null) {
            return this.baseDeflection;
        } else {
            if (this.deflectionOverTimeList.length != 2) {
                alert("just fyi, this is not implemented yet. just send 2 for now and update them through your growth cycles");
            }
            let mapped = this.deflectionOverTimeList.map((l) => l[0]);

            let min = Math.min(...mapped);
            let max = Math.max(...mapped);

            let ot = getCurDay() - this.spawnTime;

            if (ot > max) {
                return this.deflectionOverTimeList[this.deflectionOverTimeList.length - 1][1];
            }
            if (ot < min) {
                return this.deflectionOverTimeList[0][1];
            } else {
                let rel = (ot - min) / (max - min);
                return this.deflectionOverTimeList[0][1] * (1 - rel) + this.deflectionOverTimeList[1][1] * rel;
            }
        }
    }

    setCurrentDeflection(deflection) {
        let limit = Math.PI / 12;
        deflection = Math.min(Math.max(deflection, -limit), limit);

        let period = 12;

        this.currentDeflection = this.currentDeflection * (1 - (1 / period)) + deflection * (1 / period)
        if (this.deflectionRollingAverage == 0) {
            this.deflectionRollingAverage = deflection;
        } else {
            this.deflectionRollingAverage = this.deflectionRollingAverage * ((this.rollingAveragePeriod - 1) / this.rollingAveragePeriod) + deflection * (1 / this.rollingAveragePeriod);
        }
    }

    someSquareTouchingGround() {
        return this.lifeSquares.some((lsq) =>
            lsq.type == "green" &&
            lsq.state != STATE_DESTROYED &&
            lsq.groundTouchSquare() != null)
            || this.children.some((child) => child.someSquareTouchingGround());
    }
}