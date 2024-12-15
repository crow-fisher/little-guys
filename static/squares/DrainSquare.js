class DrainSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "DrainSquare";
        this.colorBase = "#555555";
        this.physicsEnabled = false;
        this.waterContainmentMax = drain_sq_waterContainmentMax;
        this.waterContainmentTransferRate = drain_sq_waterTransferRate;
    }

    percolateInnerMoisture() {
        if (this.waterContainment <= 0) {
            return 0;
        }

        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                if (abs(i) == abs(j)) {
                    continue;
                }
                if (this.waterContainment >= 1) {
                    if (addSquare(new WaterSquare(this.posX + i, this.posY + j))) {
                        this.waterContainment -= 1;
                    }
                }
            }
        }
    }

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }
}

export {DrainSquare}