import { addVec3Dest, copyVecValue } from "../../util/vector.js";
import { flatBrush } from "./brushes/flatBrush.js";
import { pixelBrush } from "./brushes/pixelBrush.js";
import { sphereBrush } from "./brushes/sphereBrush.js";
import { ManipulationManager } from "./manipulation/ManipulationManager.js";
import { Block } from "./model/Block.js";
import { BlockSector } from "./model/BlockSector.js";
import { DirtBlock } from "./model/variant/DirtBlock.js";

export class BlockManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.timeManager = worldManager.timeManager;
        this.blockManagerComponent = worldManager.mainManager.uiManager.blockManagerComponent;

        this.sectorSize = 25;
        this.manipulationManager = new ManipulationManager(this);
        this.sectors = new Map();

        this.brushes = [sphereBrush, sphereBrush, flatBrush];
        this.materials = [Block, DirtBlock];

        this.mvQueuePrecision = 100;
        this.mvQueue = new Array();
    }

    registerBlockMvTimes(block) {
        this._registerBlockMvTime(block, 0);
        this._registerBlockMvTime(block, 1);
        this._registerBlockMvTime(block, 2);
    }

    _registerBlockMvTime(block, i) {
        if (block.mvSpeed[i] == 0) {
            return;
        }
        
        this._v1 = Math.ceil((block.mvDeltaTime[i] / this.timeManager.dt) * this.mvQueuePrecision);
        if (this._v1 == 0)
            return;

        this.mvQueue[this._v1] = this.mvQueue[this._v1] ?? new Array();
        this.mvQueue[this._v1].push(block);
    }

    processBlockMovement() {
        for (let i = 0; i <= this.mvQueuePrecision; i++) {
            if (this.mvQueue[i] != null) {
                this.mvQueue[i].forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + i / this.mvQueuePrecision))
                this.mvQueue[i].length = 0;
            }
        }

        for (let i = 0; i <= this.mvQueuePrecision; i++) {
            if (this.mvQueue[i] != null) {
                this.mvQueue[i].forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + this.timeManager.dt))
                this.mvQueue[i].length = 0;
            }
        }
    }

    updateBlockPosition(block, newPosition) {
        let bCur = this.getBlockAtCartesian(newPosition);
        if (bCur) {
            return false;
        } else {
            this.getSector(block.sector).removeBlock(block.cartesian);
            block.unlinkNeighbors();

            block.cartesian[0] = newPosition[0];
            block.cartesian[1] = newPosition[1];
            block.cartesian[2] = newPosition[2];
            block.sector = this.cartesianToSector(block.cartesian);
            this.getSector(block.sector).addBlock(block);

            block.linkNeighbors();
        }
    }

    getBlockAtCartesian(sr, o = [0, 0, 0]) {
        this._cVec1 = this._cVec1 ?? [0, 0, 0];
        this._cVec2 = this._cVec2 ?? [0, 0, 0];
        this._cSect1 = null;

        addVec3Dest(sr, o, this._cVec1);
        this.cartesianToSectorInplace(this._cVec1, this._cVec2);
        this._cSect1 = this.getSector(this._cVec2);

        return this._cSect1.getBlock(this._cVec1);
    }

    addNewBlock(cartesian, type) {
        let newBlock = new type(this, cartesian);
        this.getSector(newBlock.sector).addBlock(newBlock);
    }

    brushFromRef(p, refCs, applyPrimary, applySecondary) {
        if (applyPrimary) {
            this.brushes.at(this.blockManagerComponent.gcvActivePrimaryBrush())(this, p, refCs, this.materials.at(this.blockManagerComponent.gcvActivePrimaryMaterial()));
        }
        if (applySecondary) {
            this.brushes.at(this.blockManagerComponent.gcvActiveSecondaryBrush())(this, p, refCs, this.materials.at(this.blockManagerComponent.gcvActiveSecondaryMaterial()));
        }
    }

    getSector(sr) {
        this._cSect1 = this.sectors.get(sr[0]);
        if (this._cSect1 == null) this.sectors.set(sr[0], new Map());
        this._c2 = this.sectors.get(sr[0]).get(sr[1]);
        if (this._c2 == null) this.sectors.get(sr[0]).set(sr[1], new Map());
        this._c3 = this.sectors.get(sr[0]).get(sr[1]).get(sr[2]);
        if (this._c3 == null) this.sectors.get(sr[0]).get(sr[1]).set(sr[2], new BlockSector(this, sr));
        return this.sectors.get(sr[0]).get(sr[1]).get(sr[2]);
    }

    cartesianToSector(cartesian) {
        return [
            Math.floor(cartesian[0] / this.sectorSize),
            Math.floor(cartesian[1] / this.sectorSize),
            Math.floor(cartesian[2] / this.sectorSize)
        ]
    }

    cartesianToSectorInplace(cartesian, sector) {
        sector[0] = Math.floor(cartesian[0] / this.sectorSize);
        sector[1] = Math.floor(cartesian[1] / this.sectorSize);
        sector[2] = Math.floor(cartesian[2] / this.sectorSize);
    }

    sectorToCartesian(cartesian) {
        return [
            cartesian[0] * this.sectorSize,
            cartesian[1] * this.sectorSize,
            cartesian[2] * this.sectorSize
        ]
    }
    update() {
        this.manipulationManager.update();
        this.iterateOnSectors((sector) => sector.update());
        this.processBlockMovement();
    }
    render() {
        this.manipulationManager.render();
        this.iterateOnSectors((sector) => sector.render());
    }
    iterateOnSectors(func) {
        this.sectors.keys().forEach(
            (x) => this.sectors.get(x).keys().forEach(
                (y) => this.sectors.get(x).get(y).keys().forEach(
                    (z) => func(this.sectors.get(x).get(y).get(z))
                )));
    }
    rebuildSectors() {
        this.sectors = new Map();
    }
}