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
import { WheatGreenSquare } from "./lifeSquares/parameterized/agriculture/grasses/WheatGreenSquare.js";
import { GenericParameterizedRootSquare } from "./lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { WheatOrganism, WheatSeedOrganism } from "./organisms/agriculture/WheatOrganism.js";
import { ElephantEarGreenSquare } from "./lifeSquares/parameterized/tropical/ElephantEarGreenSquare.js";
import { PalmTreeGreenSquare } from "./lifeSquares/parameterized/tropical/PalmTreeGreenSquare.js";
import { ElephantEarOrganism, ElephantEarSeedOrganism } from "./organisms/tropical/ElephantEarOrganism.js";
import { PalmTreeOrganism, PalmTreeSeedOrganism } from "./organisms/tropical/PalmTreeOrganism.js";
import { KentuckyBluegrassGreenSquare } from "./lifeSquares/parameterized/agriculture/grasses/KentuckyBluegrassGreenSquare.js";
import { KentuckyBluegrassOrganism, KentuckyBluegrassSeedOrganism } from "./organisms/agriculture/KentuckyBluegrassOrganism.js";
import { MushroomGreenSquare } from "./lifeSquares/parameterized/fantasy/MushroomGreenSquare.js";
import { MushroomOrganism, MushroomSeedOrganism } from "./organisms/fantasy/MushroomOrganism.js";

let ProtoMap = {
    "BaseSquare": BaseSquare.prototype,
    "PlantSquare": PlantSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "RockSquare": RockSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "WaterSquare": WaterSquare.prototype,
    "BaseLifeSquare": BaseLifeSquare.prototype,
    "BaseOrganism": BaseOrganism.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "SeedSquare": SeedSquare.prototype,
    "AquiferSquare": AquiferSquare.prototype,
    "WheatGreenSquare": WheatGreenSquare.prototype,
    "GenericParameterizedRootSquare": GenericParameterizedRootSquare.prototype,
    "WheatOrganism": WheatOrganism.prototype,
    "WheatSeedOrganism": WheatSeedOrganism.prototype,
    "ElephantEarSeedOrganism": ElephantEarSeedOrganism.prototype,
    "ElephantEarOrganism": ElephantEarOrganism.prototype,
    "PalmTreeOrganism": PalmTreeOrganism.prototype,
    "PalmTreeSeedOrganism": PalmTreeSeedOrganism.prototype,
    "KentuckyBluegrassGreenSquare": KentuckyBluegrassGreenSquare.prototype,
    "KentuckyBluegrassOrganism": KentuckyBluegrassOrganism.prototype,
    "KentuckyBluegrassSeedOrganism": KentuckyBluegrassSeedOrganism.prototype,
    "MushroomGreenSquare": MushroomGreenSquare.prototype,
    "MushroomOrganism": MushroomOrganism.prototype,
    "MushroomSeedOrganism": MushroomSeedOrganism.prototype,
    
}

let TypeMap = {
    [GenericParameterizedRootSquare.name]: GenericParameterizedRootSquare,
    [WheatGreenSquare.name] : WheatGreenSquare,
    [ElephantEarGreenSquare.name]: ElephantEarGreenSquare,
    [PalmTreeGreenSquare.name]: PalmTreeGreenSquare,
    [MushroomGreenSquare.name]: MushroomGreenSquare,
    [KentuckyBluegrassGreenSquare.name]: KentuckyBluegrassGreenSquare
}

let TypeNameMap = {
    GenericParameterizedRootSquare: GenericParameterizedRootSquare.name,
    WheatGreenSquare: WheatGreenSquare.name,
    ElephantEarGreenSquare: ElephantEarGreenSquare.name,
    PalmTreeGreenSquare: PalmTreeGreenSquare.name,
    MushroomGreenSquare: MushroomGreenSquare.name,
    KentuckyBluegrassGreenSquare: KentuckyBluegrassGreenSquare.name
}

export { ProtoMap, TypeMap, TypeNameMap}