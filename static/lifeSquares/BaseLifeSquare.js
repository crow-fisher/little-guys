class BaseLifeSquare {
    constructor(posX, posY) {
        this.proto = "BaseLifeSquare";
        this.posX = posX;
        this.posY = posY;
        this.type = "base";
        this.colorBase = "#1D263B";
        this.spawnedEntityId = 0;
        this.lastUpdateTime = Date.now();
        this.airNutrients = 0;
        this.waterNutrients = 0;
        this.rootNutrients = 0;
        this.linkedSquare = null;
    }

    tick() {
        this.lastUpdateTime = Date.now();
    }

    render() {
        MAIN_CONTEXT.fillStyle = this.calculateColor();
        MAIN_CONTEXT.fillRect(
            this.posX * BASE_SIZE,
            this.posY * BASE_SIZE,
            BASE_SIZE,
            BASE_SIZE
        );
    };

    calculateColor() {
        var baseColorRGB = hexToRgb(this.colorBase);
        return rgbToHex(Math.floor(baseColorRGB.r), Math.floor(baseColorRGB.g), Math.floor(baseColorRGB.b));
    }

    setSpawnedEntityId(id) {
        this.spawnedEntityId = id;
        if (this.linkedSquare != null) {
            this.linkedSquare.spawnedEntityId = id;
        }
    }

}
export {BaseLifeSquare}