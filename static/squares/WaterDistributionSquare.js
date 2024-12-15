class WaterDistributionSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "WaterDistributionSquare";
        this.colorBase = "#000500";
        this.physicsEnabled = false;
        this.waterContainmentMax = wds_sq_waterContainmentMax;
        this.waterContainmentTransferRate = wds_sq_waterContainmentTransferRate;
    }

}

export {WaterDistributionSquare}