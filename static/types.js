import { BaseSquare } from "./squares/BaseSqaure.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { PlantLifeSquare } from "./lifeSquares/PlantLifeSquare.js";
import { BasePlant } from "./plants/organisms/BasePlant.js";
import { SeedLifeSquare } from "./lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { RootLifeSquare } from "./lifeSquares/RootLifeSquare.js";
import { KentuckyBluegrassGreenSquare } from "./lifeSquares/grasses/KentuckyBluegrassGreenSquare.js";
import { KentuckyBluegrass, KentuckyBluegrassSeedOrganism } from "./plants/organisms/grasses/KentuckyBluegrass.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";

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
    "KentuckyBluegrassGreenSquare": KentuckyBluegrassGreenSquare.prototype,
    "RootLifeSquare": RootLifeSquare.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "KentuckyBluegrassSeedOrganism": KentuckyBluegrassSeedOrganism.prototype
}

export const TypeMap = {
    [RootLifeSquare.name]: RootLifeSquare,
    [KentuckyBluegrassGreenSquare.name]: KentuckyBluegrassGreenSquare
}

export const TypeNameMap = {
    RootLifeSquare: RootLifeSquare.name,
    KentuckyBluegrassGreenSquare: KentuckyBluegrassGreenSquare.name
}