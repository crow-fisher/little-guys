import { BaseSquare } from "./squares/BaseSqaure.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { BaseLifeSquare } from "./lifeSquares/BaseLifeSquare.js";
import { BaseOrganism } from "./organisms/BaseOrganism.js";
import { SeedLifeSquare } from "./lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { WheatGreenSquare } from "./lifeSquares/grasses/WheatGreenSquare.js";
import { GenericRootSquare } from "./lifeSquares/GenericRootSquare.js";
import { WheatOrganism, WheatSeedOrganism } from "./organisms/grasses/WheatOrganism.js";
import { KentuckyBluegrassGreenSquare } from "./lifeSquares/grasses/KentuckyBluegrassGreenSquare.js";
import { KentuckyBluegrassOrganism, KentuckyBluegrassSeedOrganism } from "./organisms/grasses/KentuckyBluegrassOrganism.js";
import { PalmTreeOrganism, PalmTreeSeedOrganism } from "./organisms/trees/PalmTreeOrganism.js";
import { CattailOrganism, CattailSeedOrganism } from "./organisms/grasses/CattailOrganism.js";
import { CattailGreenSquare } from "./lifeSquares/grasses/CattailGreenSquare.js";
import { PalmTreeGreenSquare } from "./lifeSquares/trees/PalmTreeGreenSquare.js";
import { ConeflowerOrganism, ConeflowerSeedOrganism } from "./organisms/flowers/ConeflowerOrganism.js";
import { ConeflowerGreenSqaure } from "./lifeSquares/flowers/ConeflowerGreenSqaure.js";

let ProtoMap = {
    "BaseSquare": BaseSquare.prototype,
    "PlantSquare": PlantSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "RockSquare": RockSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "WaterSquare": WaterSquare.prototype, 
    "AquiferSquare": AquiferSquare.prototype,

    "BaseOrganism": BaseOrganism.prototype,
    "WheatOrganism": WheatOrganism.prototype,
    "PalmTreeOrganism": PalmTreeOrganism.prototype,
    "KentuckyBluegrassOrganism": KentuckyBluegrassOrganism.prototype,
    "CattailOrganism": CattailOrganism.prototype,
    "ConeflowerOrganism": ConeflowerOrganism.prototype,

    "BaseLifeSquare": BaseLifeSquare.prototype,
    "WheatGreenSquare": WheatGreenSquare.prototype,
    "PalmTreeGreenSquare": PalmTreeGreenSquare.prototype,
    "KentuckyBluegrassGreenSquare": KentuckyBluegrassGreenSquare.prototype,
    "CattailGreenSquare": CattailGreenSquare.prototype,
    "ConeflowerGreenSqaure": ConeflowerGreenSqaure.prototype,
    "GenericRootSquare": GenericRootSquare.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "WheatSeedOrganism": WheatSeedOrganism.prototype,
    "PalmTreeSeedOrganism": PalmTreeSeedOrganism.prototype,
    "KentuckyBluegrassSeedOrganism": KentuckyBluegrassSeedOrganism.prototype,
    "CattailSeedOrganism": CattailSeedOrganism.prototype,
    "ConeflowerSeedOrganism": ConeflowerSeedOrganism.prototype
}

let TypeMap = {
    [GenericRootSquare.name]: GenericRootSquare,
    [WheatGreenSquare.name] : WheatGreenSquare,
    [PalmTreeGreenSquare.name]: PalmTreeGreenSquare,
    [KentuckyBluegrassGreenSquare.name]: KentuckyBluegrassGreenSquare,
    [CattailGreenSquare.name]: CattailGreenSquare,
    [ConeflowerGreenSqaure.name]: ConeflowerGreenSqaure
}

let TypeNameMap = {
    GenericRootSquare: GenericRootSquare.name,
    WheatGreenSquare: WheatGreenSquare.name,
    PalmTreeGreenSquare: PalmTreeGreenSquare.name,
    KentuckyBluegrassGreenSquare: KentuckyBluegrassGreenSquare.name,
    CattailGreenSquare: CattailGreenSquare.name,
    ConeflowerGreenSqaure: ConeflowerGreenSqaure.name
}

export { ProtoMap, TypeMap, TypeNameMap}