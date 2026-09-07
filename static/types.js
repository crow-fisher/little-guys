import { BaseSquare } from "./squares/BaseSqaure.js";
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
import { WheatOrganism, WheatSeedOrganism } from "./organisms/grass/WheatOrganism.js";
import { BaseGrassOrganism, BaseGrassSeedOrganism } from "./organisms/grass/BaseGrassOrganism.js";
import { PalmTreeOrganism, PalmTreeSeedOrganism } from "./organisms/trees/PalmTreeOrganism.js";
import { CattailOrganism, CattailSeedOrganism } from "./organisms/grass/CattailOrganism.js";
import { ConeflowerOrganism, ConeflowerSeedOrganism } from "./organisms/flowers/ConeflowerOrganism.js";
import { PleurocarpMossGreenSquare } from "./lifeSquares/mosses/PleurocarpMossGreenSquare.js";
import { PleurocarpMossOrganism } from "./organisms/mosses/PleurocarpMossOrganism.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";

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
    "WheatOrganism": WheatOrganism.prototype,
    "PalmTreeOrganism": PalmTreeOrganism.prototype,
    "BaseGrassOrganism": BaseGrassOrganism.prototype,
    "CattailOrganism": CattailOrganism.prototype,
    "ConeflowerOrganism": ConeflowerOrganism.prototype,
    "PleurocarpMossOrganism": PleurocarpMossOrganism.prototype,

    "LifeSquareGreen": LifeSquareGreen.prototype,
    "LifeSquareRoot": LifeSquareRoot.prototype,
    "PleurocarpMossGreenSquare": PleurocarpMossGreenSquare.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "WheatSeedOrganism": WheatSeedOrganism.prototype,
    "PalmTreeSeedOrganism": PalmTreeSeedOrganism.prototype,
    "BaseGrassSeedOrganism": BaseGrassSeedOrganism.prototype,
    "CattailSeedOrganism": CattailSeedOrganism.prototype,
    "ConeflowerSeedOrganism": ConeflowerSeedOrganism.prototype
}

let TypeMap = {
    [LifeSquareRoot.name]: LifeSquareRoot,
    [LifeSquareGreen.name]: LifeSquareGreen,
    [PleurocarpMossGreenSquare.name]: PleurocarpMossGreenSquare
}

let TypeNameMap = {
    LifeSquareRoot: LifeSquareRoot.name,
    LifeSquareGreen: LifeSquareGreen.name,

    PleurocarpMossGreenSquare: PleurocarpMossGreenSquare.name
}

export { ProtoMap, TypeMap, TypeNameMap}