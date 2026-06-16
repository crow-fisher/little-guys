import { addVec3Dest, copyVecValue } from "../../util/vector.js";
import { flatBrush } from "./brushes/flatBrush.js";
import { pixelBrush } from "./brushes/pixelBrush.js";
import { sphereBrush } from "./brushes/sphereBrush.js";
import { ManipulationManager } from "./manipulation/ManipulationManager.js";
import { Block } from "./model/Block.js";
import { BlockSector } from "./model/BlockSector.js";

export class BlockManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.sectorSize = 25;
        this.manipulationManager = new ManipulationManager(this);
        this.sectors = new Map();
        
        this.curBrush = flatBrush;
    }

    getBlockAtCartesian(sr, o=[0, 0, 0]) {
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
        this.getSector(newBlock.sector).addBlock(newBlock);
    }

    brushFromRef(p, refCs) {
        this.curBrush(this, p, refCs);
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