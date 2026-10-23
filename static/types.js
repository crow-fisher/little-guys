import { BaseSquare } from "./squares/BaseSquare.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { LifeSquareGreen } from "./lifeSquares/LifeSquareGreen.js";
import { BaseOrganism } from "./organisms/BaseOrganism.js";
import { SeedLifeSquare } from "./lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { LifeSquareRoot } from "./lifeSquares/LifeSquareRoot.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";
import { BaseLeafNodeFlower, BaseLeafNodeFlowerSeedOrganism } from "./organisms/flowers/leafNode/BaseLeafNodeFlower.js";

let ProtoMap = {
    "BaseSquare": BaseSquare.prototype,
    "PlantSquare": PlantSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "RockSquare": RockSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "WaterSquare": WaterSquare.prototype, 
    "AquiferSquare": AquiferSquare.prototype,

    "ImageSquare": ImageSquare.prototype,
    "StaticImageSquare": StaticImageSquare.prototype,
    "BackgroundImageSquare": BackgroundImageSquare.prototype,
    "RigidImageSquare": RigidImageSquare.prototype,

    "BaseOrganism": BaseOrganism.prototype,
    "BaseLeafNodeFlower": BaseLeafNodeFlower.prototype,
    "BaseLeafNodeFlowerSeedOrganism": BaseLeafNodeFlowerSeedOrganism.prototype,

    "LifeSquareGreen": LifeSquareGreen.prototype,
    "LifeSquareRoot": LifeSquareRoot.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
}

let TypeMap = {
    [LifeSquareRoot.name]: LifeSquareRoot,
    [LifeSquareGreen.name]: LifeSquareGreen,
}

let TypeNameMap = {
    LifeSquareRoot: LifeSquareRoot.name,
    LifeSquareGreen: LifeSquareGreen.name,
}

export { ProtoMap, TypeMap, TypeNameMap}