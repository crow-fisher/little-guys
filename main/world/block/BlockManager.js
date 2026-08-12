import { addVec3Dest, copyVecValue, getVec3LengthSquared } from "../../util/vector.js";
import { flatBrush } from "./brushes/flatBrush.js";
import { pixelBrush } from "./brushes/pixelBrush.js";
import { sphereBrush } from "./brushes/sphereBrush.js";
import { ManipulationManager } from "./manipulation/ManipulationManager.js";
import { Block } from "./model/Block.js";
import { BlockSector } from "./model/BlockSector.js";
import { ColorBlock } from "./model/variant/ColorBlock.js";
import { DirtBlock } from "./model/variant/DirtBlock.js";
import { StoneBlock } from "./model/variant/StoneBlock.js";

export class BlockManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.timeManager = worldManager.timeManager;
        this.uiManager = worldManager.mainManager.uiManager;
        this.blockManagerComponent = worldManager.mainManager.uiManager.blockManagerComponent;
        this.blockConfig = this.uiManager._config["BlockAttributeComponent"];

        this.sectorSize = 25;
        this.manipulationManager = new ManipulationManager(this);
        this.sectors = new Map();

        this.brushes = [sphereBrush, pixelBrush, flatBrush];
        this.materials = [StoneBlock, DirtBlock, ColorBlock];

        this.mvQueuePrecision = 100;
        this.mvQueue = new Array();
        this.mvBlocks = new Array();
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

        this.mvBlocks.push(block);

        if (block.mvDeltaTime[i] > (this.timeManager.dt / 1000)) {
            // do nothing
        } else {
            this._v1 = Math.ceil((block.mvDeltaTime[i] / (this.timeManager.dt / 1000)) * this.mvQueuePrecision);
            this.mvQueue[this._v1] = this.mvQueue[this._v1] ?? new Array();
            this.mvQueue[this._v1].push(block);
        }

    }

    processBlockMovement() {
        for (let i = 0; i <= this.mvQueuePrecision; i++) {
            // if (this.mvQueue[i] != null) {
                // this.mvQueue[i].forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + i / this.mvQueuePrecision))
                // this.mvQueue[i].length = 0;
                this.mvBlocks.forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + (i / this.mvQueuePrecision) * this.timeManager.dt));
                // this.mvQueue[i].forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + i / this.mvQueuePrecision))
                // this.mvQueue[i].length = 0;
            // }

            // console.log(i, Date.now(), this.timeManager.curDate, this.timeManager.curDate + (i / this.mvQueuePrecision) * this.timeManager.dt);
        }



        // this.mvBlocks.forEach((block) => block.applyMovementAtTime(this.timeManager.curDate + this.timeManager.dt));
        // this.mvBlocks.forEach((block) => block.applyMovementAtTime(Date.now()));
        this.mvBlocks.length = 0;
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

            if (getVec3LengthSquared(block.cartesian) > 10000)
                return false;

            this.getSector(block.sector).addBlock(block);
            block.linkNeighbors();
            return true;
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

    addNewBlock(cartesian) {
        let newBlock = new Block(this, cartesian);
        let curBlock = this.getSector(newBlock.sector).getBlock(cartesian);
        if (curBlock) {
            this.applyBlockAttributes(curBlock);
            return;
        }        
        this.getSector(newBlock.sector).addBlock(newBlock);
        newBlock.linkNeighbors();
        this.applyBlockAttributes(newBlock);
    }

    applyBlockAttributes(ref) {
        if (true) {
            copyVecValue(this.blockConfig.colorConfig.rgbArr, ref.colorBase);
            ref.recalculateColorFlag = true;
        }
        
        if (true) {
            if (this.blockConfig.transparency.active) {
                ref.opacity = this.blockConfig.transparency.value;
            } else {
                ref.opacity = 1;
            }
        }

        if (true) {
            if (this.blockConfig.size.active) {
                ref.size[0] = this.blockConfig.size.x;
                ref.size[1] = this.blockConfig.size.y;
                ref.size[2] = this.blockConfig.size.z;
            } else {
                ref.size[0] = 1;
                ref.size[1] = 1;
                ref.size[2] = 1;
            }
        }

        if (true) {
            if (this.blockConfig.offset.active) {
                ref.offset[0] = this.blockConfig.offset.x;
                ref.offset[1] = this.blockConfig.offset.y;
                ref.offset[2] = this.blockConfig.offset.z;
            } else {
                ref.offset[0] = 0;
                ref.offset[1] = 0;
                ref.offset[2] = 0;
            }
        }
        ref.applyMovement();
    }

    brushFromRef(p, refCs, applyPrimary, applySecondary) {
        if (applyPrimary) {
            this.brushes.at(this.blockManagerComponent.gcvActivePrimaryBrush())(this, p, refCs, this.materials.at(this.uiManager.toolbarConfig.activeTool));
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