import { BaseSquare } from "./squares/BaseSqaure.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { PlantLifeSquare } from "./plants/lifeSquares/PlantLifeSquare.js";
import { BasePlant } from "./plants/organisms/BasePlant.js";
import { SeedLifeSquare } from "./plants/lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { KentuckyBluegrass, KentuckyBluegrassSeedOrganism } from "./plants/organisms/grasses/KentuckyBluegrass.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";
import { RootLifeSquare } from "./plants/lifeSquares/RootLifeSquare.js";

export const ProtoMap = {
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

    "BasePlant": BasePlant.prototype,
    "KentuckyBluegrass": KentuckyBluegrass.prototype,
    "PlantLifeSquare": PlantLifeSquare.prototype,
    "RootLifeSquare": RootLifeSquare.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "KentuckyBluegrassSeedOrganism": KentuckyBluegrassSeedOrganism.prototype
}

export const TypeMap = {
    [RootLifeSquare.name]: RootLifeSquare,
}

export const TypeNameMap = {
    RootLifeSquare: RootLifeSquare.name,
}