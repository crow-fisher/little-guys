import { copyVecValue } from "../../util/vector.js";
import { ManipulationManager } from "./manipulation/ManipulationManager.js";
import { Block } from "./model/Block.js";
import { BlockSector } from "./model/BlockSector.js";

export class BlockManager {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.sectorSize = 25;
        this.manipulationManager = new ManipulationManager(this);
        this.sectors = new Map();
    }

    addBlockAtRef(refCs) {
        let newBlock = new Block(this, refCs.world)
        this._c1 = this.getSector(newBlock.sector);
        this._c1.blocks.push(newBlock);

        let brushSize = 2;

        let cartesian = structuredClone(refCs.world);
        for (let i = -brushSize; i < brushSize; i++) {
            for (let j = -brushSize; j < brushSize; j++) {
                for (let k = -brushSize; k < brushSize; k++) {
                    copyVecValue(refCs.world, cartesian);
                    
                    cartesian[0] += i;
                    cartesian[1] += j;
                    cartesian[2] += k;

                    let newBlock = new Block(this, cartesian)
                    this._c1 = this.getSector(newBlock.sector);
                    this._c1.blocks.push(newBlock);

                }
            }
        }
    }

    getSector(sr) {
        this._c1 = this.sectors.get(sr[0]);
        if (this._c1 == null) this.sectors.set(sr[0], new Map());
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