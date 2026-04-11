import { getCurDay } from "../../../climate/time.js";
import { addVectors, addVectorsMult, copyVecValue, multiplyVectorByScalar, normalizeVec3 } from "../../../climate/stars/matrix.js";
import { getAtmosphereHandler, getWindSpeedAtLocation } from "../../../main.js";


export class GrowthComponent {
    constructor(growthPlan, lifeSquares, xb, yb, zb, xbc, ybc, zbc, type, strengthMult) {
        this.growthPlan = growthPlan;
        this.lifeSquares = Array.from(lifeSquares);
        this.deflection_base = [xb, yb, zb];
        this.deflection_base_curve = [xbc, ybc, zbc];
        this.deflection_wind_current = [0, 0, 0];
        this.type = type;
        this.strengthMult = strengthMult;
        this.children = new Array();
        this.parentComponent = null;
        this.distToFront = 0;
        this.spawnTime = getCurDay();
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

    addLifeSquare(newLsq) {
        this.lifeSquares.push(newLsq);
    }

    addChild(childComponent) {
        if (this.children.indexOf(childComponent) != -1) {
            return;
        }
        this.children.push(childComponent);
        childComponent.parentComponent = this;
    }

    updateDeflectionState(startWorldOffset) {
        this._curOffset = this._curOffset ?? [0, 0, 0]
        this._curOffsetDir = this._curOffsetDir ?? [0, 0, 0];
        this._offsetDelta = this._offsetDelta ?? [0, -1, 0];

        copyVecValue(startWorldOffset, this._curOffset);
        copyVecValue(this.deflection_base, this._curOffsetDir);
        this.applyComponentWind(this._curOffsetDir);
        normalizeVec3(this._curOffsetDir);
        for (let i = 0; i < this.lifeSquares.length; i++) {
            copyVecValue(this._curOffset, this.lifeSquares.at(i).posVec);
            copyVecValue(this._curOffsetDir, this.lifeSquares.at(i).posVecDir);

            addVectors(this._curOffsetDir, this.deflection_base_curve);
            normalizeVec3(this._curOffsetDir);
            addVectorsMult(this._curOffset, this._curOffsetDir, 0.8)
        };
        this.children.forEach((child) => child.updateDeflectionState(this._curOffset));
    }

    applyComponentWind(valueArray) {
        let cur = this.lifeSquares.at(Math.floor(this.lifeSquares.length / 2)) ?? this.lifeSquares.at(0);
        if (!cur) {
            return;
        } 
        this._curWind = this._curWind ?? [0, 0, 0];
        copyVecValue(getWindSpeedAtLocation(cur.cartesian_tl), this._curWind);
        multiplyVectorByScalar(valueArray, 0.95);
        addVectorsMult(valueArray, this._curWind, 3);
    }

    getValueCached(name, calculation) {
        if (this.valueCache == null || !(this.valueCache instanceof Map) || this.valueCacheDay != getCurDay()) {
            this.valueCache = new Map();
            this.valueCacheDay = getCurDay();
        }
        if (this.valueCache.has(name)) {
            return this.valueCache.get(name);
        } else {
            this.valueCache.set(name, calculation());
            return this.valueCache.get(name);
        }
    }
    getCountLifeSquares() {
        return Math.max(1, this.lifeSquares.length + this.getCountChildLifeSquares());
    }
    getCountChildLifeSquares() {
        return this.children.map((child) => child.getCountLifeSquares()).reduce(
            (a, b) => a + b, 0
        );
    }
    getCountLifeSquaresOfType(type) {
        if (this.type == type)
            return Math.max(1, this.lifeSquares.length + this.getCountChildLifeSquares());
        return 0;
    }
    getCountChildLifeSquaresOfType(type) {
        return this.getChildrenOfType(type).map((child) => child.getCountChildLifeSquaresOfType(type)).reduce(
            (a, b) => a + b, 0
        );
    }
}