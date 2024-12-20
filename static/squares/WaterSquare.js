import { BaseSquare } from "./BaseSqaure.js";
import {
    water_viscocity,
    water_darkeningStrength,
    } from "../config/config.js"

import {getDirectNeighbors, addSquare, addSquareOverride, getSquares, getCollidableSquareAtLocation, iterateOnSquares, getNeighbors} from "./_sqOperations.js";
import {
    ALL_SQUARES, ALL_ORGANISMS, ALL_ORGANISM_SQUARES, stats,
    getNextGroupId, updateGlobalStatistic, getGlobalStatistic
} from "../globals.js";

import { getObjectArrFromMap, removeItemAll, hexToRgb, rgbToHex, randNumber} from "../common.js";
import {purge, reset, render, physics, physicsBefore, processOrganisms, renderOrganisms, doWaterFlow, removeSquareAndChildren} from "../globalOperations.js"
import { getOrganismSquaresAtSquare } from "../lifeSquares/_lsOperations.js";

import { WATERFLOW_CANDIDATE_SQUARES, WATERFLOW_TARGET_SQUARES } from "../globals.js";

class WaterSquare extends BaseSquare {  
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WaterSquare";
        this.boundedTop = false;
        this.solid = false;
        this.viscocity = water_viscocity;
        this.currentPressureDirect = -1;
        this.currentPressureIndirect = -1;

        this.baseColor = "#0093AF";
        this.darkColor = "#2774AE";
        this.accentColor = "#85B09A";
        this.opacity = 0.5;
        
        this.blockHealth = 100;
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
    calculateDarkeningColor() {
        return this.calculateDarkeningColorImpl(this.currentPressureIndirect, getGlobalStatistic("pressure") + 1);
    }

    physicsBefore() {
        super.physicsBefore();
        this.calculateDirectPressure();
    }

    physicsBefore2() {
        super.physicsBefore2();
        this.calculateIndirectPressure(0);
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
                    if (Array.from(getSquares(this.posX + i, this.posY + j).filter((sq) => sq.solid || sq.proto == this.proto)).length == 0) {
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
            .forEach((sq) => this.currentPressureDirect = sq.currentPressureDirect + 1)

        var curY = this.posY - 1;
        if (this.currentPressureDirect == 0) {
            while (true) {
                var squaresAtPos = getSquares(this.posX, curY);
                if (squaresAtPos.length == 0) {
                    break;
                }
                if (Array.from(squaresAtPos.filter((sq) => sq.solid && sq.collision)).length > 0) {
                    break;
                }
                curY -= 1;
                this.currentPressureDirect += 1;
            }
        }

        getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.proto == this.proto)
            .filter((sq) => sq.group == this.group)
            .forEach((sq) => sq.currentPressureDirect = this.currentPressureDirect + 1)

    }
    calculateIndirectPressure(startingPressure) {
        // we are looking for neighbors *of the same group*. 
        // we will only do this calculation *once* per group. 
        // starting on the top left member of that group.
        if (this.currentPressureIndirect != -1) {
            return;
        }

        var perGroupData = new Map();
        iterateOnSquares((sq) => {
            if (!(sq.group in perGroupData)) {
                perGroupData[sq.group] = new Map();
                perGroupData[sq.group]["minPosY"] = 10 ** 8;
            }
            perGroupData[sq.group]["minPosY"] = Math.min(sq.posY, perGroupData[sq.group]["minPosY"])
        })
        iterateOnSquares((sq) => {
            sq.currentPressureIndirect = sq.currentPressureDirect + sq.posY - perGroupData[sq.group]["minPosY"];
        })
        // var nodes = [this];
        // var visited = set();
        // var curIdx = 0;
        // var cur = null;
        // while (curIdx < nodes.length) {
        //     cur = nodes[curIdx];

        //         getDirectNeighbors(this.posX, this.posY)
        //         .filter((sq) => sq != null && sq.group == this.group)
        //         .forEach((myNeighbor) => {
        //             if (!(myNeighbor in visited)) {
        //                 var dy = myNeighbor.posY - this.posY;
        //                 myNeighbor.currentPressureIndirect = Math.max(myNeighbor.currentPressureDirect, startingPressure + dy);

        //                 myNeighbor.calculateIndirectPressure(startingPressure + dy);
        //             }

        //         });
        // }
        
        // getDirectNeighbors(this.posX, this.posY)
        //     .filter((sq) => sq != null && sq.group == this.group)
        //     .forEach((myNeighbor) => {
        //         var dy = myNeighbor.posY - this.posY;
        //         myNeighbor.calculateIndirectPressure(startingPressure + dy);
        //     });
    }

    doNeighborPercolation() {
        getDirectNeighbors(this.posX, this.posY).forEach((sq) => {
            if (sq == null) {
                return;
            }
            if (sq.organic) {
                getOrganismSquaresAtSquare(sq.posX, sq.posY).forEach(
                    (osq) => this.blockHealth -= osq.adjacentWater(this.blockHealth)
                );
                return;
            }
            if (sq.collision == false) {
                return;
            }
            if (sq.solid) {
                this.blockHealth -= sq.percolateFromWater(this);
            } else if (sq.proto == this.proto) {
                if (sq.blockHealth <= this.blockHealth) {
                    var diff = 1 - this.blockHealth;
                    if (diff > sq.blockHealth) {
                        this.blockHealth += sq.blockHealth;
                        removeSquareAndChildren(sq);
                    } else {
                        this.blockHealth += diff;
                        sq.blockHealth -= diff;
                    }
                }
            }
        });
    }
}

export {WaterSquare}