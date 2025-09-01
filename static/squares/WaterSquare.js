import { BaseSquare } from "./BaseSqaure.js";
import { getSquares, iterateOnSquares, getNeighbors, addSquare } from "./_sqOperations.js";
import { getGroupSize, getNextGroupId, WATERFLOW_CANDIDATE_SQUARES, WATERFLOW_TARGET_SQUARES } from "../globals.js";
import { MAIN_CONTEXT } from "../index.js";
import { RGB_COLOR_OTHER_BLUE } from "../colors.js";
import { hexToRgb, hsv2rgb, randRange, rgb2hsv, rgbToRgba } from "../common.js";
import { loadGD, UI_LIGHTING_WATER, UI_LIGHTING_WATER_HUE, UI_LIGHTING_WATER_VALUE, UI_LIGHTING_WATER_SATURATION, UI_LIGHTING_WATER_OPACITY, UI_SIMULATION_CLOUDS } from "../ui/UIData.js";
import { getBaseSize, zoomCanvasFillRect } from "../canvas.js";
import { getActiveClimate } from "../climate/climateManager.js";
import { applyLightingFromSource, getDefaultLighting } from "../lighting/lightingProcessing.js";
import { deregisterSquare, isGroupContiguous, registerSquare } from "../waterGraph.js";
import { getGroupMinPosY } from "../globalOperations.js";
import { convertMinutesToTimeUnit } from "../climate/weather/weather.js";
import { getWindSpeedAtLocation } from "../climate/simulation/wind.js";
class WaterSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WaterSquare";
        this.solid = false;
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;
        this.gravity = 1;

        this.color = getActiveClimate().waterColor;

        this.opacity = 0.5;

        this.blockHealthMax = 1;
        this.blockHealth = this.blockHealthMax;

        // water starts as a liquid 
        this.state = 1;
        this.thermalConductivity = 0.6;
        this.thermalMass = 4.2;
        this.blockHealthGravityCoef = 0.7;
    }
    spawnParticle(dx, dy, sx, sy, amount) {
        let sq = new WaterSquare(this.posX + dx, this.posY + dy);
        if (addSquare(sq)) {
            sq.blockHealth = amount;
            this.blockHealth -= amount;
            applyLightingFromSource(this, sq);
            sq.speedX += sx;
            sq.speedY += sy;
            sq.gravityPhysics();
            sq.groupId = getNextGroupId();
            return amount;
        }
        return 0;
    }

    windPhysics() {
        if (!loadGD(UI_SIMULATION_CLOUDS))
            return;

        let ws = getWindSpeedAtLocation(this.posX, this.posY);
        let maxWindSpeed = 10;

        let wx = Math.min(Math.max(ws[0], -maxWindSpeed), maxWindSpeed);
        let wy = Math.min(Math.max(ws[1], -maxWindSpeed), maxWindSpeed);

        let px = Math.abs(wx) / maxWindSpeed;
        let py = Math.abs(wy) / maxWindSpeed;

        let factor = .04;

        let projX = (wx > 0 ? 1 : -1);
        let projY = (wy > 0 ? 1 : -1);

        let minProjSize = 0.2;
        let maxProjSize = 0.4;

        if (Math.abs(this.speedX) < 1 && Math.abs(this.speedY) < 1 && this.blockHealth > maxProjSize) {
            let d = 0.022;
            let b = 2.2;
            let c = 2;
            let x = (wx ** 2 + wy ** 2) ** 0.4;
            if (x < 1)
                return;
            let particleProbability = (Math.E / (40 * Math.E + c)) * (b + (1 / c)) ** x - d;

            if (Math.random() < particleProbability) {
                let amount = randRange(minProjSize, maxProjSize);
                this.spawnParticle(projX, projY, factor * (wx / amount), factor * (wy / amount), amount)
            }
        } else {
            if (Math.random() < px) {
                this.speedX += factor * (wx / (Math.max(.01, this.blockHealth)));
            }
            if (Math.random() < py) {
                this.speedY += factor * (wy / (Math.max(.01, this.blockHealth)));
            }
        }
    }


    getLightFilterRate() {
        return super.getLightFilterRate() * Math.exp(-loadGD(UI_LIGHTING_WATER));
    }

    getColorBase() {
        let base = getActiveClimate().waterColor;
        let hsv = rgb2hsv(base.r, base.g, base.b);
        hsv[0] += 360 * loadGD(UI_LIGHTING_WATER_HUE);
        hsv[1] = loadGD(UI_LIGHTING_WATER_SATURATION);
        hsv[2] = 255 * loadGD(UI_LIGHTING_WATER_VALUE);
        let rgb = hsv2rgb(...hsv);
        return { r: rgb[0], g: rgb[1], b: rgb[2] }
    }

    reset() {
        super.reset();
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;

        if (Math.random() > 0.99) {
            getSquares(this.posX, this.posY)
                .filter((sq) => sq.proto == this.proto)
                .filter((sq) => sq != this)
                .forEach((sq) => sq.destroy(true));
        }
    }

    physics() {
        super.physics();
        this.doNeighborPercolation();
        // this.combineAdjacentNeighbors();
        this.calculateCandidateFlows();
    }

    renderWaterSaturation() {
        MAIN_CONTEXT.fillStyle = rgbToRgba(RGB_COLOR_OTHER_BLUE.r, RGB_COLOR_OTHER_BLUE.g, RGB_COLOR_OTHER_BLUE.b, loadGD(UI_LIGHTING_WATER_OPACITY) * this.blockHealth ** 0.2);
        zoomCanvasFillRect(
            this.posX * getBaseSize(),
            this.posY * getBaseSize(),
            getBaseSize(),
            getBaseSize()
        );
    }

    renderWaterTickrate() {
        this.renderWaterSaturation();
    }
    renderMatricPressure() {
        this.renderWaterSaturation();
    }

    physicsBefore() {
        if (this.speedY != 0 || this.speedX != 0) {
            return;
        }
        super.physicsBefore();
        this.calculateIndirectPressure();
    }

    triggerParticles(bonkSpeed) {
        // if (Date.now() < this.spawnTime + 100) {
        //     return;
        // }
        // for (let i = 0; i < 4; i += Math.random()) {
        //     let speed = randRange(0, (bonkSpeed ** 0.25) - 1);
        //     let theta = randRange(0, 2 * Math.PI);
        //     let speedX = speed * Math.cos(theta);
        //     let speedY = Math.max(speed * Math.sin(theta), 0) / 4;
        //     let size = this.blockHealth * randRange(getBaseSize() * 0.2, getBaseSize() * 0.6);
        //     this.activeParticles.push([this.posX, this.posY, theta, speedX, speedY, size])
        // }
    }

    calculateCandidateFlows() {
        if (!WATERFLOW_CANDIDATE_SQUARES.has(this.group)) {
            WATERFLOW_CANDIDATE_SQUARES.set(this.group, new Map());
        }
        if (!WATERFLOW_TARGET_SQUARES.has(this.group)) {
            WATERFLOW_TARGET_SQUARES.set(this.group, new Map());
        }

        let candidateMap = WATERFLOW_CANDIDATE_SQUARES.get(this.group);
        let targetMap = WATERFLOW_TARGET_SQUARES.get(this.group);

        if (this.currentPressureDirect == 0) {
            if (!candidateMap.has(this.currentPressureIndirect)) {
                candidateMap.set(this.currentPressureIndirect, new Array());
            }
            candidateMap.get(this.currentPressureIndirect).push(this);
        }

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i != 0 && j != 0)
                    continue;
                let pressure = this.currentPressureIndirect + j;
                if (getSquares(this.posX + i, this.posY + j).some((sq) => sq.solid && sq.testCollidesWithSquare(this))) {
                    continue;
                }
                let foundWater = getSquares(this.posX + i, this.posY + j).find((sq) => sq.proto == this.proto);
                if (foundWater != null && foundWater.group != this.group) {
                    if (getGroupSize(this.group) > getGroupSize(foundWater.group)) {
                        this._percolateGroup();
                    } else {
                        foundWater._percolateGroup();
                    }
                }
                if (foundWater == null || foundWater.blockHealth != 1) {
                    if (!targetMap.has(pressure)) {
                        targetMap.set(pressure, new Array());
                    }
                    targetMap.get(pressure).push([this.posX + i, this.posY + j, i]);
                }
            }
        }
    }

    calculateIndirectPressure() {
        this.currentPressureIndirect = this.posY - getGroupMinPosY(this.group);
    }


    updatePosition(newPosX, newPosY) {
        deregisterSquare(this.posX, this.posY, this.group);
        let ret = super.updatePosition(newPosX, newPosY);
        registerSquare(this.posX, this.posY, this.group);

        if (Math.random() > 0.997) {
            if (!isGroupContiguous(this.group)) {
                this.group = getNextGroupId();
                this._percolateGroup();
            }
        }
        return ret;
    }

    doNeighborPercolation() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.solid && sq.collision)
            .forEach((sq) => this.blockHealth -= sq.percolateFromWater(this));
    }

    combineAdjacentNeighbors() {
        if (this.blockHealth < this.blockHealthMax) {
            getNeighbors(this.posX, this.posY)
                .filter((sq) => sq.proto == this.proto)
                .filter((sq) => (sq.posY < this.posY || (sq.posY == this.posY && Math.random() > 0.5)))
                .forEach((sq) => {
                    let start = this.blockHealth;
                    this.blockHealth = Math.min(this.blockHealthMax, this.blockHealth + sq.blockHealth / 2);
                    sq.blockHealth -= this.blockHealth - start;
                });
        }

    }
}

export { WaterSquare }