import { getCurDay } from "../../../climate/time.js";
import { getWindSpeedAtLocation } from "../../../climate/simulation/wind.js";
import { copyVecValue } from "../../../climate/stars/matrix.js";
import { PlantLifeSquare } from "../../lifeSquares/PlantLifeSquare.js";


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

    updateDeflectionState(startOffset) {
        copyVecValue(startOffset, this.curOffset);
        for (let i = 0; i < this.lifeSquares.length; i++) {
            copyVecValue(this.curOffset, this.lifeSquares.at(i).startPointVec);
            this.curOffset[1] -= 1;
        }
    }

    getNetWindSpeed() {
        return this.getValueCached("getNetWindSpeed", () => {
            let ret = this._getNetWindSpeed();
            this.children.forEach((child) => {
                let childWs = child.getNetWindSpeed();
                ret[0] += childWs[0];
                ret[1] += childWs[1];
            });
            return ret;
        });
    }

    _getNetWindSpeed() {
        // todo: project this as a vector off of the lookat plane! 
        // like, so however you have the thing tilted is how the wind blows

        // maybe instep for 3d wind? 
        
        return this.getValueCached("_getNetWindSpeed", () => this.lifeSquares
            .map((lsq) => getWindSpeedAtLocation(lsq.posVec[0], lsq.posVec[1])).reduce(
                (accumulator, currentValue) => [accumulator[0] + currentValue[0], accumulator[1] + currentValue[1]],
                [0, 0]
            ));
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