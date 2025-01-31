import { BaseSquare } from "./BaseSqaure.js";
import {
    water_viscocity,
    water_darkeningStrength,
} from "../config/config.js"

import { getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, getNeighbors } from "./_sqOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic,
    waterDarkeningColorCache
} from "../globals.js";

import { WATERFLOW_CANDIDATE_SQUARES, WATERFLOW_TARGET_SQUARES } from "../globals.js";

import { darkeningColorCache } from "../globals.js";
import { BASE_SIZE, MAIN_CONTEXT, zoomCanvasFillRect } from "../index.js";
import { COLOR_BLUE } from "../colors.js";

class WaterSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WaterSquare";
        this.boundedTop = false;
        this.solid = false;
        this.viscocity = water_viscocity;
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;
        this.rootable = false;
        this.calculateGroupFlag = true; 
        
        this.baseColor = COLOR_BLUE;
        this.darkColor = "#2774AE";
        this.accentColor = "#85B09A";
        this.opacity = 0.5;

        this.blockHealthMax = 1;
        this.blockHealth = this.blockHealthMax;

        // water starts as a liquid 
        this.state = 1;
        this.thermalConductivity = 0.6;
        this.thermalMass = 4.2;
        this.temperature = 273;
        this.lightFilterRate /= 3;
    }

    reset() {
        super.reset();
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;
    }

    physics() {
        super.physics();
        this.calculateCandidateFlows();
        this.doNeighborPercolation();
        this.doLocalColorSwapping();
    }

    doLocalColorSwapping() {
        if (Math.random() > 0.99) {
            getNeighbors(this.posX, this.posY).filter((sq) => sq.group == this.group).forEach((sq) => {
                if (Math.random() > 0.75) {
                    this.swapColors(sq);
                }
            });
        }
    }
    renderWaterSaturation() {
        this.renderAsGrey();
    }

    renderAsGrey() {
        MAIN_CONTEXT.fillStyle = "rgba(102, 81, 196, 0.16)";
        zoomCanvasFillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    blockPressureAndModDarken() {
        MAIN_CONTEXT.fillStyle = this.calculateDarkeningColorImpl(this.currentPressureIndirect, 13);
        zoomCanvasFillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }
    calculateDarkeningColorImpl(darkVal, darkValMax) {
        if (darkVal == 0) {
            return "rgba(73,121,107,0)";
        }
        var waterColor255 = Math.floor((darkVal / darkValMax) * 255) * this.opacity;
        if (waterColor255 in waterDarkeningColorCache) {
            return waterDarkeningColorCache[waterColor255];
        }
        var darkeningStrength = (darkVal / darkValMax) * 0.8;
        var res = "rgba(73,121,107," + darkeningStrength + ")";

        waterDarkeningColorCache[waterColor255] = res;

        return res;
    }

    physicsBefore() {
        super.physicsBefore();
        this.calculateDirectPressure();
        this.checkAdhesion();
    }

    physicsBefore2() {
        super.physicsBefore2();
        this.calculateIndirectPressure();
        updateGlobalStatistic("pressure", this.currentPressureIndirect);
    }

    calculateCandidateFlows() {
        if (this.currentPressureIndirect == 0) {
            WATERFLOW_CANDIDATE_SQUARES.add(this);
        }
        if (this.currentPressureIndirect >= this.currentPressureDirect) {
            for (var i = -1; i < 2; i++) {
                for (var j = (this.currentPressureIndirect > 2 ? -1 : 0); j < 2; j++) {
                    if (Math.abs(i) == Math.abs(j)) {
                        continue;
                    }
                    if (Array.from(
                        getSquares(this.posX + i, this.posY + j)
                            .filter((sq) => sq.collision || sq.proto == this.proto))
                        .length == 0) {

                        if (!(this.currentPressureIndirect in WATERFLOW_TARGET_SQUARES)) {
                            WATERFLOW_TARGET_SQUARES[this.currentPressureIndirect] = new Set();
                        }
                        WATERFLOW_TARGET_SQUARES[this.currentPressureIndirect].add([this.posX + i, this.posY + j, this.group]);
                    }
                }
            }
        }
    }

    /**
     * Direct pressure is how many blocks of water are directly above us. 
     */
    calculateDirectPressure() {
        this.currentPressureDirect = 0;
        getSquares(this.posX, this.posY - 1)
            .filter((sq) => sq.proto == this.proto)
            .filter((sq) => sq.group == this.group)
            .filter((sq) => sq.currentPressureDirect > 0)
            .forEach((sq) => this.currentPressureDirect = sq.currentPressureDirect + 1);
    }
    calculateIndirectPressure() {
        if (this.currentPressureIndirect != -1) {
            return;
        }

        var perGroupData = new Map();
        iterateOnSquares((sq) => {
            if (sq.proto != this.proto) {
                return;
            }
            if (!(sq.group in perGroupData)) {
                perGroupData[sq.group] = new Map();
                perGroupData[sq.group]["minPosY"] = 10 ** 8;
            }
            perGroupData[sq.group]["minPosY"] = Math.min(sq.posY, perGroupData[sq.group]["minPosY"])
        })
        iterateOnSquares((sq) => {
            if (sq.proto != this.proto) {
                return;
            }
            sq.currentPressureIndirect = Math.max(sq.currentPressureDirect, sq.posY - perGroupData[sq.group]["minPosY"]);
        })
    }

    checkAdhesion() {
        for (let side = -1; side <= 1; side += 2) {
            if (getSquares(this.posX + side, this.posY).some((sq) => sq.collision && sq.solid)) {
                var shouldFall = false;
                this.frameFrozen = true;
                for (let i = 0; i < this.currentPressureDirect; i++) {
                    shouldFall |= Math.random() > 0.9999;
                }
                this.frameFrozen = !shouldFall;
            }
        }
    }
    doNeighborPercolation() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .filter((sq) => sq.solid)
            .forEach((sq) => this.blockHealth -= sq.percolateFromWater(this));

        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.group == this.group)
            .filter((sq) => sq.blockHealth <= this.blockHealth)
            .filter((sq) => (sq.blockHealth + this.blockHealth) < this.blockHealthMax)
            .forEach((sq) => {
                this.blockHealth += sq.blockHealth;
                sq.blockHealth = 0;
                sq.destroy();
            });
    }
}

export { WaterSquare }