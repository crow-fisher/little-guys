export class BlockSector {
    constructor(blockManager, sector) {
        this.blockManager = blockManager;
        this.sector = sector;
        this.blocks = new Map();
    }

    addBlock(block) {
        this._bc = block.cartesian;
        this._rb = this.blocks.get(this._bc[0])?.get(this._bc[1])?.get(this._bc[2]);
        this._c1 = this.blocks.get(this._bc[0]);
        if (this._c1 == null) this.blocks.set(this._bc[0], new Map());
        this._c2 = this.blocks.get(this._bc[0]).get(this._bc[1]);
        if (this._c2 == null) this.blocks.get(this._bc[0]).set(this._bc[1], new Map());
        this._c3 = this.blocks.get(this._bc[0]).get(this._bc[1]).get(this._bc[2]);
        if (this._c3 == null) this.blocks.get(this._bc[0]).get(this._bc[1]).set(this._bc[2], block);
    }

    update() {
        this.iterateOnBlocks((block) => block.update());
    }

    render() {
        this.iterateOnBlocks((block) => block.render());
    }

    iterateOnBlocks(func) {
        this.blocks.keys().forEach(
            (x) => this.blocks.get(x).keys().forEach(
                (y) => this.blocks.get(x).get(y).keys().forEach(
                    (z) => func(this.blocks.get(x).get(y).get(z))
                )));

    }
}