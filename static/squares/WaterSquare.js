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
        
        // this.baseColor = "#60EFFF";
        // this.darkColor = "#7EF8FA";
        // this.accentColor = "#3BEBF1";

        this.baseColor = "#60EFFF";
        this.darkColor = "#60EFFF";
        this.accentColor = "#60EFFF";

        this.opacity = 0.2;

        this.blockHealthMax = 1;
        this.blockHealth = this.blockHealthMax;

        // water starts as a liquid 
        this.state = 1;
        this.thermalConductivity = 0.6;
        this.thermalMass = 4.2;
        this.temperature = 273;
        this.lightFilterRate /= 8;
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
        if (Math.random() > 0.999) {
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

    physicsBefore() {
        super.physicsBefore();
        this.calculateIndirectPressure();
    }

    calculateCandidateFlows() {
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

    doNeighborPercolation() {
        getNeighbors(this.posX, this.posY)
            .filter((sq) => sq.collision)
            .filter((sq) => sq.solid)
            .forEach((sq) => this.blockHealth -= sq.percolateFromWater(this));
    }
}

export { WaterSquare }