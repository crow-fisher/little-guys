import { getCurDay } from "../../../climate/time.js";
import { getWindSpeedAtLocation } from "../../../climate/simulation/wind.js";
import { addVectors, copyVecValue, crossVec3, crossVec3Dest, multiplyVectorByScalar, normalizeVec3, subtractVectors } from "../../../climate/stars/matrix.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";
import { getAtmosphereHandler } from "../../../main.js";


export class GrowthComponent {
    constructor(growthPlan, lifeSquares, theta, sin, phi, thetaCurve, sinCurve, phiCurve, type, strengthMult) {
        this.growthPlan = growthPlan;
        this.lifeSquares = Array.from(lifeSquares);
        this.deflection_base = [theta, sin, phi];
        this.deflection_base_curve = [thetaCurve, sinCurve, phiCurve];
        this.deflection_applied = [0, 0];
        this.curOffset = [0, 0, 0]
        this.dv = [0, 0, 0];
        this.ddv = [0, 0, 0];
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
        copyVecValue(startWorldOffset, this.curOffset);

        // this._ws = this.getNetWindSpeed();
        this._ws = [0, 0, 0];
        let x = this._ws[0];
        let y = 1;
        let z = this._ws[1]
        let offset = [-x, -y, -z];

        normalizeVec3(offset);
        let offsetPerUnit = structuredClone(offset);
        offsetPerUnit[0] /= -this.lifeSquares.length;
        offsetPerUnit[2] /= -this.lifeSquares.length;

        let curOffset = [0, -1, 0];
        for (let i = 0; i < this.lifeSquares.length; i++) {
            curOffset[0] += offsetPerUnit[0];
            curOffset[2] += offsetPerUnit[2];
            normalizeVec3(curOffset);
            copyVecValue(this.curOffset, this.lifeSquares.at(i).rootPositionVec);
            addVectors(this.curOffset, curOffset)
            this.lifeSquares.at(i).posVecDir = structuredClone(curOffset);
        };
        this.children.forEach((child) => child.updateDeflectionState(this.curOffset));
    }

    getNetWindSpeed() { // this is so random...im srry
        return getAtmosphereHandler().getWindSpeedAtLocation(this.lifeSquares.at(0).cartesian_tl);
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