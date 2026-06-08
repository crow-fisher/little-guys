export class BlockSector {
    constructor(blockManager, sector) {
        this.blockManager = blockManager;
        this.sector = sector;
        this.cartesian = this.blockManager.cartesianToSector(sector);;
        this.blocks = new Array();
    }

    update() {
        this.blocks.forEach((block) => block.update());
    }

    render() {
        this.blocks.forEach((block) => block.render());
    }

}