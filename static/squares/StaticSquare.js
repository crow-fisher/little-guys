class StaticSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "StaticSquare";
        this.colorBase = "#000100";
        this.physicsEnabled = false;
        this.waterContainmentMax = static_sq_waterContainmentMax;
        this.waterContainmentTransferRate = static_sq_waterContainmentTransferRate;
    }
}

export {StaticSquare}