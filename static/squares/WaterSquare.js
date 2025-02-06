import { BaseSquare } from "./BaseSqaure.js";
import {
    water_viscocity,
    water_darkeningStrength,
} from "../config/config.js"

import { addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, getNeighbors } from "./_sqOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic,
    waterDarkeningColorCache
} from "../globals.js";

import { WATERFLOW_CANDIDATE_SQUARES, WATERFLOW_TARGET_SQUARES } from "../globals.js";

import { darkeningColorCache } from "../globals.js";
import { BASE_SIZE, MAIN_CONTEXT, zoomCanvasFillRect } from "../index.js";
import { COLOR_BLUE, COLOR_RED, RGB_COLOR_OTHER_BLUE, RGB_COLOR_RED } from "../colors.js";
import { rgbToRgba } from "../common.js";

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
        
        this.baseColor = "#60EFFF";
        this.darkColor = "#7EF8FA";
        this.accentColor = "#3BEBF1";

        this.opacity = 0.4;

        this.blockHealthMax = 1;
        this.blockHealth = this.blockHealthMax;

        // water starts as a liquid 
        this.state = 1;
        this.thermalConductivity = 0.6;
        this.thermalMass = 4.2;
        this.temperature = 273;
        this.lightFilterRate /= 2;
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
        this.combineAdjacentNeighbors();
        this.doLocalColorSwapping();
    }

    doLocalColorSwapping() {
        if (Math.random() > 0.999) {
            getNeighbors(this.posX, this.posY).filter((sq) => sq.group == this.group).forEach((sq) => {
                if (Math.random() > 0.75) {
                    this.swapColors(sq);
                }
            });
        }
    }
    renderWaterSaturation() {
        MAIN_CONTEXT.fillStyle = rgbToRgba(RGB_COLOR_OTHER_BLUE.r, RGB_COLOR_OTHER_BLUE.g, RGB_COLOR_OTHER_BLUE.b, (this.blockHealth / this.blockHealthMax));
        zoomCanvasFillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    }

    physicsBefore() {
        super.physicsBefore();
        this.calculateIndirectPressure();
    }

    calculateCandidateFlows() {
        if (this.speedY > 0) {
            return;
        }

        if (!(this.group in WATERFLOW_CANDIDATE_SQUARES)) {
            WATERFLOW_CANDIDATE_SQUARES[this.group] = new Map();
        }
        if (!(this.group in WATERFLOW_TARGET_SQUARES)) {
            WATERFLOW_TARGET_SQUARES[this.group] = new Map();
        }


        var candidateMap = WATERFLOW_CANDIDATE_SQUARES[this.group];
        var targetMap = WATERFLOW_TARGET_SQUARES[this.group]
        if (!(this.currentPressureIndirect in candidateMap)) {
            candidateMap[this.currentPressureIndirect] = new Array();
        }
        candidateMap[this.currentPressureIndirect].push(this);
        if (this.currentPressureIndirect >= this.currentPressureDirect) {
            for (var i = -1; i < 2; i++) {
                for (var j = -1; i < 2; i++) {
                    // if (Math.abs(i) == Math.abs(j)) {
                    //     continue;
                    // }
                    if (!(getSquares(this.posX + i, this.posY + j)
                            .some((sq) => sq.collision || sq.proto == this.proto))) {
                        if (!(this.currentPressureIndirect in targetMap)) {
                            targetMap[this.currentPressureIndirect] = new Array();
                        }
                        targetMap[this.currentPressureIndirect].push([this.posX + i, this.posY + j]);
                    }
                }
            }
        }
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
                perGroupData[sq.group] = 10 ** 8;
            }
            perGroupData[sq.group] = Math.min(sq.posY, perGroupData[sq.group])
        });

        iterateOnSquares((sq) => {
            if (sq.proto != this.proto) {
                return;
            }
            sq.currentPressureIndirect = Math.max(sq.currentPressureDirect, sq.posY - perGroupData[sq.group]);
        })
    }

    doNeighborPercolation() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .filter((sq) => sq.solid)
            .forEach((sq) => this.blockHealth -= sq.percolateFromWater(this));
    }

    combineAdjacentNeighbors() {
        if (this.blockHealth < this.blockHealthMax) {
            getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.proto == this.proto)
            .filter((sq) => sq.posY <= this.posY)
            .forEach((sq) => {
                var start = this.blockHealth;
                this.blockHealth = Math.min(1, this.blockHealth + sq.blockHealth);
                sq.blockHealth -= this.blockHealth - start;
            });
        }

    }
}

export { WaterSquare }